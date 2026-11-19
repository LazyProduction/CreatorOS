import type { Metadata } from "next";
import { Check, Zap } from "lucide-react";
import { buyCreditPack, openPortal, startSubscription } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardTitle } from "@/components/ui/card";
import { KINDS } from "@/lib/ai/kinds";
import { CREDIT_PACKS, PLANS, formatPrice, planOf } from "@/lib/plans";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Abonnement" };

const ERRORS: Record<string, string> = {
  stripe: "Les paiements ne sont pas encore activés sur cette instance.",
  price: "Ce produit n'est pas encore configuré dans Stripe.",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const { success, error } = await searchParams;
  const { profile, credits } = await requireSession();
  const current = planOf(profile.plan);
  const subscribed = profile.subscription_status === "active" || profile.subscription_status === "trialing";

  return (
    <div className="space-y-5">
      {success && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {success === "pack" ? "Merci ! Tes crédits ont été ajoutés." : "Merci ! Ton abonnement est actif."} (la mise à jour peut prendre quelques secondes)
        </p>
      )}
      {error && <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{ERRORS[error] ?? "Une erreur est survenue."}</p>}

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted">Plan actuel</p>
          <p className="font-display text-2xl font-semibold">{current.name}</p>
          <p className="mt-1 text-xs text-subtle">
            {profile.monthly_credits} crédits du mois · {profile.bonus_credits} crédits achetés · renouvellement le{" "}
            {new Date(profile.credits_period_end).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 font-display text-3xl font-semibold tabular-nums">
              <Zap className="h-5 w-5 text-brand-text" /> {credits}
            </p>
            <p className="text-xs text-subtle">crédits disponibles</p>
          </div>
          {profile.stripe_customer_id && (
            <form action={openPortal}>
              <Button variant="secondary">Gérer</Button>
            </form>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.key === profile.plan;
          return (
            <Card key={plan.key} className={cn("flex flex-col", plan.highlight && "border-brand-border shadow-glow")}>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlight && <Badge>Populaire</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted">{plan.tagline}</p>
              <p className="mt-4 font-display text-3xl font-semibold">
                {plan.priceMonthly ? formatPrice(plan.priceMonthly) : "0 €"}
                <span className="text-sm font-normal text-muted"> / mois</span>
              </p>
              {plan.priceYearly > 0 && <p className="text-xs text-subtle">ou {formatPrice(plan.priceYearly)} / an (2 mois offerts)</p>}
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-text" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2">
                {isCurrent ? (
                  <Button variant="secondary" disabled className="w-full">
                    Plan actuel
                  </Button>
                ) : plan.key === "free" ? null : subscribed ? (
                  <form action={openPortal}>
                    <Button variant={plan.highlight ? "primary" : "secondary"} className="w-full">
                      Changer de plan
                    </Button>
                  </form>
                ) : (
                  <>
                    <form action={startSubscription}>
                      <input type="hidden" name="plan" value={plan.key} />
                      <input type="hidden" name="interval" value="monthly" />
                      <Button variant={plan.highlight ? "primary" : "secondary"} className="w-full">
                        Choisir {plan.name}
                      </Button>
                    </form>
                    <form action={startSubscription}>
                      <input type="hidden" name="plan" value={plan.key} />
                      <input type="hidden" name="interval" value="yearly" />
                      <button className="w-full text-xs text-muted hover:text-fg">Payer à l'année</button>
                    </form>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardTitle>Recharger des crédits</CardTitle>
        <p className="mt-1 text-xs text-muted">Les crédits achetés n'expirent pas et s'utilisent après ceux du mois.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CREDIT_PACKS.map((pack) => (
            <form key={pack.key} action={buyCreditPack} className="flex items-center justify-between rounded-xl border border-line p-4">
              <input type="hidden" name="pack" value={pack.key} />
              <div>
                <p className="flex items-center gap-1 font-semibold">
                  <Zap className="h-4 w-4 text-brand-text" /> {pack.credits} crédits
                </p>
                <p className="text-xs text-subtle">{formatPrice(pack.price)}</p>
              </div>
              <Button variant="secondary" size="sm">
                Acheter
              </Button>
            </form>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Combien coûte chaque génération ?</CardTitle>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {Object.entries(KINDS).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
              {v.label}
              <span className="flex items-center gap-0.5 text-xs font-semibold text-brand-text">
                <Zap className="h-3 w-3" />
                {v.credits}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-subtle">Le Kanban, le calendrier, le téléprompteur et le suivi des publications sont gratuits et illimités.</p>
      </Card>
    </div>
  );
}
