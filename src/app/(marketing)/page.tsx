import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  Hash,
  KanbanSquare,
  Lightbulb,
  MonitorPlay,
  Palette,
  Send,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { CREDIT_PACKS, PLANS, formatPrice } from "@/lib/plans";
import { CONTENT_TYPES } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Lightbulb, title: "Idées avec un vrai angle", text: "Donne un thème, reçois 8 idées que personne n'a encore faites, adaptées à ta niche." },
  { icon: Type, title: "Titres et hooks", text: "Des propositions aux mécaniques différentes. Tu choisis ton préféré en un clic." },
  { icon: FileText, title: "Scripts prêts à tourner", text: "Structure, rythme oral, plans de coupe. Écrit dans TON style, pas celui d'un consultant." },
  { icon: Hash, title: "Description, tags, posts", text: "SEO YouTube, hashtags et un post adapté à chaque réseau : LinkedIn, X, Instagram, Discord." },
  { icon: Palette, title: "Branding de chaîne", text: "Noms, slogan, bios, palette, polices, piliers de contenu et prompts pour ton logo." },
  { icon: MonitorPlay, title: "Téléprompteur", text: "Ton script défile à ta vitesse, en plein écran ou en miroir. Gratuit et illimité." },
  { icon: KanbanSquare, title: "Pipeline Kanban", text: "Idée, écriture, tournage, montage, publication : glisse tes projets d'une étape à l'autre." },
  { icon: CalendarDays, title: "Calendrier et suivi", text: "Planifie tes sorties et suis tes publications et leurs chiffres au même endroit." },
  { icon: Send, title: "Partage Discord", text: "Annonce chaque nouvelle vidéo à ta communauté en un clic." },
];

const STEPS = [
  { n: "1", title: "Une idée", text: "Tape un thème ou choisis une idée générée." },
  { n: "2", title: "Tout le contenu", text: "Titre, hook, script, description, tags et posts en quelques secondes." },
  { n: "3", title: "Tu tournes", text: "Lis ton script au téléprompteur, coche ta checklist." },
  { n: "4", title: "Tu publies", text: "Planifie, partage sur Discord et suis tes résultats." },
];

const FAQ = [
  { q: "C'est quoi un crédit IA ?", a: "Une génération courte (titres, hooks, tags, description, idées) coûte 1 crédit. Un script coûte 3 crédits, un branding complet 3, un kit vidéo complet 4. Le reste de l'outil est gratuit." },
  { q: "L'IA marche pour le gaming, l'humour, la cuisine… ?", a: "Oui. Elle s'adapte à ton univers, ton vocabulaire et ton ton grâce à ton profil créateur. Elle n'écrit pas comme une agence marketing." },
  { q: "Je peux annuler quand je veux ?", a: "Oui, sans engagement. Tu gardes l'accès jusqu'à la fin de la période payée, puis tu repasses sur le plan gratuit." },
  { q: "Et la connexion à YouTube, TikTok, Instagram ?", a: "La connexion YouTube avec l'analyse IA de tes statistiques et commentaires arrive en premier, suivie des autres réseaux. Les abonnés y auront accès dès la sortie." },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-softer px-3 py-1 text-xs font-medium text-brand-text">
          <Sparkles className="h-3.5 w-3.5" /> L'espace de travail IA des créateurs
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          De l'idée à la publication, <span className="text-gradient">sans la page blanche.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg">
          Idées, titres, hooks, scripts, descriptions, tags et branding générés par l'IA dans ton style. Puis pipeline de production, téléprompteur et suivi des publications. Tout au même endroit.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className={buttonClass("primary", "lg")}>
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#tarifs" className={buttonClass("outline", "lg")}>
            Voir les tarifs
          </Link>
        </div>
        <p className="mt-3 text-xs text-subtle">30 crédits IA offerts chaque mois · sans carte bancaire</p>

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-2">
          {CONTENT_TYPES.filter((t) => t !== "Autre").map((t) => (
            <span key={t} className="rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-fg">{s.n}</span>
              <p className="mt-4 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Tout ton workflow de créateur</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">Une seule app au lieu de cinq onglets, trois notes et un tableur.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:border-brand-border">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="card mt-4 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center">
          <span className="rounded-full border border-brand-border bg-brand-softer px-2.5 py-0.5 text-xs font-medium text-brand-text">Bientôt</span>
          <p className="text-sm text-muted">
            Connexion YouTube, TikTok, Instagram, X et LinkedIn · analyse IA des stats et des commentaires · génération de miniatures et logos · découpe automatique en shorts · veille concurrentielle.
          </p>
        </div>
      </section>

      <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Des tarifs simples</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">L'organisation est gratuite pour toujours. Tu paies seulement pour l'IA.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <div key={plan.key} className={cn("card flex flex-col p-6", plan.highlight && "border-brand-border shadow-glow")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{plan.name}</p>
                {plan.highlight && <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-fg">Populaire</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <p className="mt-5 font-display text-4xl font-semibold">
                {plan.priceMonthly ? formatPrice(plan.priceMonthly) : "0 €"}
                <span className="text-sm font-normal text-muted"> / mois</span>
              </p>
              {plan.priceYearly > 0 ? <p className="text-xs text-subtle">ou {formatPrice(plan.priceYearly)} / an</p> : <p className="text-xs text-subtle">pour toujours</p>}
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-text" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={buttonClass(plan.highlight ? "primary" : "secondary", "md", "mt-6 w-full")}>
                {plan.key === "free" ? "Commencer gratuitement" : `Essayer ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Zap className="mr-1 inline h-4 w-4 text-brand-text" />
          Besoin de plus ? Recharges sans abonnement : {CREDIT_PACKS.map((p) => `${p.credits} crédits à ${formatPrice(p.price)}`).join(" · ")}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Questions fréquentes</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {f.q}
                <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="card relative overflow-hidden p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,var(--brand-soft),transparent)]" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Ta prochaine vidéo commence ici.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-muted">Crée ton espace en 30 secondes. Aucune carte bancaire.</p>
          <Link href="/signup" className={buttonClass("primary", "lg", "relative mt-8")}>
            Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
