export type PlanKey = "free" | "creator" | "pro";
export type Interval = "monthly" | "yearly";

export type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  monthlyCredits: number;
  priceMonthly: number; // en euros
  priceYearly: number; // prix annuel total
  features: string[];
  highlight?: boolean;
};

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: "free",
    name: "Gratuit",
    tagline: "Pour s'organiser et tester l'IA",
    monthlyCredits: 30,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "30 crédits IA chaque mois",
      "Projets illimités",
      "Pipeline Kanban et calendrier",
      "Téléprompteur illimité",
      "Suivi des publications",
    ],
  },
  creator: {
    key: "creator",
    name: "Créateur",
    tagline: "Pour publier chaque semaine",
    monthlyCredits: 300,
    priceMonthly: 9.99,
    priceYearly: 99,
    highlight: true,
    features: [
      "300 crédits IA chaque mois",
      "Tout le plan Gratuit",
      "Kit vidéo complet en un clic",
      "Scripts longs et branding de chaîne",
      "Historique de toutes les générations",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    tagline: "Pour les créateurs multi-plateformes",
    monthlyCredits: 1200,
    priceMonthly: 24.99,
    priceYearly: 249,
    features: [
      "1 200 crédits IA chaque mois",
      "Tout le plan Créateur",
      "Accès prioritaire aux nouveautés (analyse, miniatures)",
      "Support prioritaire",
    ],
  },
};

export const CREDIT_PACKS = [
  { key: "pack_100", credits: 100, price: 4.99 },
  { key: "pack_500", credits: 500, price: 19.99 },
] as const;
export type PackKey = (typeof CREDIT_PACKS)[number]["key"];

export function planOf(plan: string | null | undefined): Plan {
  return PLANS[(plan as PlanKey) in PLANS ? (plan as PlanKey) : "free"];
}

export function formatPrice(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0 });
}
