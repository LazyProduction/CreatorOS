import type { Metadata } from "next";
import Link from "next/link";
import { addDays, format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, CalendarClock, CheckCircle2, Clapperboard, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { IdeaGenerator } from "@/components/idea-generator";
import { NewProjectButton } from "@/components/new-project";
import { Card, CardTitle, EmptyState } from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { planOf } from "@/lib/plans";
import { platformColor, platformLabel } from "@/lib/platforms";
import type { Project, Stage } from "@/lib/types";

export const metadata: Metadata = { title: "Accueil" };

function greeting() {
  const h = new Date().getHours();
  return h < 6 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir";
}

export default async function DashboardPage() {
  const { supabase, profile, credits } = await requireSession();
  const [{ data: stagesData }, { data: projectsData }, { count: publishedThisMonth }] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase.from("projects").select("*").eq("archived", false).order("updated_at", { ascending: false }),
    supabase.from("publications").select("id", { count: "exact", head: true }).gte("published_at", startOfMonth(new Date()).toISOString()),
  ]);
  const stages = (stagesData ?? []) as Stage[];
  const projects = (projectsData ?? []) as Project[];
  const publishedStageIds = new Set(stages.filter((s) => s.is_published_stage).map((s) => s.id));
  const inProgress = projects.filter((p) => !p.stage_id || !publishedStageIds.has(p.stage_id));
  const now = new Date();
  const upcoming = inProgress
    .filter((p) => p.publish_at && new Date(p.publish_at) >= addDays(now, -1))
    .sort((a, b) => +new Date(a.publish_at!) - +new Date(b.publish_at!))
    .slice(0, 5);
  const thisWeek = upcoming.filter((p) => new Date(p.publish_at!) <= addDays(now, 7)).length;
  const plan = planOf(profile.plan);
  const name = profile.display_name?.split(" ")[0];

  const stats = [
    { label: "Projets en cours", value: inProgress.length, icon: Clapperboard },
    { label: "À publier cette semaine", value: thisWeek, icon: CalendarClock },
    { label: "Publiés ce mois-ci", value: publishedThisMonth ?? 0, icon: CheckCircle2 },
    { label: "Crédits IA", value: credits, icon: Zap, hint: `sur ${plan.monthlyCredits} / mois` },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`${greeting()}${name ? ` ${name}` : ""} 👋`} description="Voici où en est ta production." actions={<NewProjectButton stages={stages} />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between text-xs text-muted">
              {s.label}
              <s.icon className="h-4 w-4 text-brand-text" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{s.value}</p>
            {s.hint && <p className="text-[11px] text-subtle">{s.hint}</p>}
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-text" /> Trouver ta prochaine idée
          </CardTitle>
          <p className="mt-1 mb-4 text-xs text-muted">Donne un thème, l'IA te propose des angles que personne n'a encore faits.</p>
          <IdeaGenerator stages={stages} placeholder={profile.niche ? `ex : ${profile.niche}` : undefined} />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Prochaines publications</CardTitle>
            <Link href="/calendar" className="text-xs text-brand-text hover:underline">
              Calendrier
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {upcoming.length ? (
              upcoming.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-surface-2">
                    <div className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-surface-2 py-1">
                      <span className="text-[10px] text-subtle uppercase">{format(new Date(p.publish_at!), "MMM", { locale: fr })}</span>
                      <span className="text-sm font-semibold">{format(new Date(p.publish_at!), "d")}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.chosen_title || p.title}</p>
                      <p className="flex items-center gap-1.5 text-xs text-subtle">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: platformColor(p.platform) }} />
                        {platformLabel(p.platform)} · {format(new Date(p.publish_at!), "HH:mm")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-line-strong p-4 text-center text-xs text-muted">Aucune date de publication prévue. Planifie tes projets pour les voir ici.</p>
            )}
          </ul>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <CardTitle>Pipeline</CardTitle>
          <Link href="/pipeline" className="flex items-center gap-1 text-xs text-brand-text hover:underline">
            Ouvrir <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {projects.length ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {stages.map((s) => {
              const n = projects.filter((p) => p.stage_id === s.id).length;
              return (
                <Link key={s.id} href="/pipeline" className="rounded-xl border border-line p-3 transition hover:border-line-strong">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{n}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon={<Clapperboard className="h-5 w-5" />} title="Ton premier projet t'attend">
              Crée un projet ou transforme une idée générée ci-dessus en projet.
            </EmptyState>
          </div>
        )}
      </Card>
    </div>
  );
}
