import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import type { Generation, Project, Publication, Stage } from "@/lib/types";
import { ProjectEditor } from "./editor";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireSession();
  const { data } = await supabase.from("projects").select("title, chosen_title").eq("id", id).maybeSingle();
  return { title: data?.chosen_title || data?.title || "Projet" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, profile } = await requireSession();
  const [{ data: project }, { data: stages }, { data: gens }, { data: pubs }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase.from("generations").select("id, project_id, kind, input, output, credits_used, model, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(60),
    supabase.from("publications").select("*").eq("project_id", id).order("published_at", { ascending: false }),
  ]);
  if (!project) notFound();

  const latest: Record<string, Generation["output"]> = {};
  for (const g of (gens ?? []) as Generation[]) if (!latest[g.kind]) latest[g.kind] = g.output;

  return (
    <ProjectEditor
      project={project as Project}
      stages={(stages ?? []) as Stage[]}
      latest={latest}
      publications={(pubs ?? []) as Publication[]}
      platforms={profile.platforms}
      hasDiscord={Boolean(profile.discord_webhook_url)}
    />
  );
}
