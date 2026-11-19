"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { packPriceId, stripe, stripeEnabled, subscriptionPriceId } from "@/lib/stripe";
import type { Interval, PackKey } from "@/lib/plans";
import { siteUrl } from "@/lib/utils";

async function customerFor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/billing");
  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, display_name, subscription_status, plan").eq("id", user.id).single();
  let customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      name: profile?.display_name ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await createAdminClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }
  return { user, customerId, profile };
}

export async function startSubscription(form: FormData) {
  if (!stripeEnabled()) redirect("/settings/billing?error=stripe");
  const plan = form.get("plan") === "pro" ? "pro" : "creator";
  const interval: Interval = form.get("interval") === "yearly" ? "yearly" : "monthly";
  const price = subscriptionPriceId(plan, interval);
  if (!price) redirect("/settings/billing?error=price");

  const { user, customerId, profile } = await customerFor();
  // Déjà abonné : on passe par le portail pour changer de plan.
  if (profile?.subscription_status === "active" || profile?.subscription_status === "trialing") return openPortal();

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    success_url: `${siteUrl()}/settings/billing?success=subscription`,
    cancel_url: `${siteUrl()}/settings/billing`,
    locale: "fr",
  });
  redirect(session.url!);
}

export async function buyCreditPack(form: FormData) {
  if (!stripeEnabled()) redirect("/settings/billing?error=stripe");
  const pack = String(form.get("pack")) as PackKey;
  const price = packPriceId(pack);
  if (!price) redirect("/settings/billing?error=price");
  const { user, customerId } = await customerFor();
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { user_id: user.id, pack },
    success_url: `${siteUrl()}/settings/billing?success=pack`,
    cancel_url: `${siteUrl()}/settings/billing`,
    locale: "fr",
  });
  redirect(session.url!);
}

export async function openPortal() {
  if (!stripeEnabled()) redirect("/settings/billing?error=stripe");
  const { customerId } = await customerFor();
  const session = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: `${siteUrl()}/settings/billing` });
  redirect(session.url);
}
