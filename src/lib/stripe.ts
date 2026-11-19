import "server-only";
import Stripe from "stripe";
import type { Interval, PackKey, PlanKey } from "@/lib/plans";
import { CREDIT_PACKS, PLANS } from "@/lib/plans";

let _stripe: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

export function subscriptionPriceId(plan: Exclude<PlanKey, "free">, interval: Interval) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key] ?? null;
}

export function packPriceId(pack: PackKey) {
  return process.env[`STRIPE_PRICE_${pack.toUpperCase()}`] ?? null;
}

/** Retrouve le plan correspondant à un price Stripe. */
export function planFromPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  for (const plan of ["creator", "pro"] as const) {
    for (const interval of ["monthly", "yearly"] as const) {
      if (subscriptionPriceId(plan, interval) === priceId) return plan;
    }
  }
  return null;
}

export function packCredits(pack: string): number {
  return CREDIT_PACKS.find((p) => p.key === pack)?.credits ?? 0;
}

export { PLANS };
