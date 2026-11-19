import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanKey } from "@/lib/plans";
import { packCredits, planFromPriceId, stripe } from "@/lib/stripe";

const nextPeriod = () => new Date(Date.now() + 31 * 24 * 3600 * 1000).toISOString();

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (e) {
    console.error("[stripe] invalid signature", e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = createAdminClient();

  // Idempotence : chaque événement n'est traité qu'une fois.
  const { error: dup } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dup) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.user_id ?? s.client_reference_id;
        if (!userId) break;
        const customer = typeof s.customer === "string" ? s.customer : s.customer?.id;

        if (s.mode === "subscription") {
          const plan = (s.metadata?.plan === "pro" ? "pro" : "creator") as PlanKey;
          const subscription = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          await db
            .from("profiles")
            .update({
              plan,
              stripe_customer_id: customer,
              stripe_subscription_id: subscription,
              subscription_status: "active",
              monthly_credits: PLANS[plan].monthlyCredits,
              credits_period_end: nextPeriod(),
            })
            .eq("id", userId);
        } else if (s.mode === "payment" && s.payment_status === "paid") {
          const credits = packCredits(s.metadata?.pack ?? "");
          if (credits > 0) {
            const { data: p } = await db.from("profiles").select("bonus_credits").eq("id", userId).single();
            await db.from("profiles").update({ bonus_credits: (p?.bonus_credits ?? 0) + credits, stripe_customer_id: customer }).eq("id", userId);
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = planFromPriceId(sub.items.data[0]?.price?.id) ?? ((sub.metadata?.plan as PlanKey) || "creator");
        const active = sub.status === "active" || sub.status === "trialing";
        await db
          .from("profiles")
          .update({
            plan: active ? plan : "free",
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
          })
          .eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : sub.customer.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .from("profiles")
          .update({
            plan: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            monthly_credits: PLANS.free.monthlyCredits,
            credits_period_end: nextPeriod(),
          })
          .eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : sub.customer.id);
        break;
      }

      case "invoice.paid": {
        // Renouvellement mensuel : on recharge les crédits du plan.
        const inv = event.data.object as Stripe.Invoice;
        if (inv.billing_reason !== "subscription_cycle") break;
        const customer = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (!customer) break;
        const { data: p } = await db.from("profiles").select("plan").eq("stripe_customer_id", customer).single();
        const plan = (p?.plan ?? "free") as PlanKey;
        await db
          .from("profiles")
          .update({ monthly_credits: PLANS[plan].monthlyCredits, credits_period_end: nextPeriod(), subscription_status: "active" })
          .eq("stripe_customer_id", customer);
        break;
      }
    }
  } catch (e) {
    console.error("[stripe] webhook handling failed", event.type, e);
    // On retire l'événement pour que Stripe puisse le renvoyer.
    await db.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
