import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell";
import { NewProjectButton } from "@/components/new-project";
import { requireSession } from "@/lib/session";
import type { Project, Stage } from "@/lib/types";
import { ProjectList } from "./list";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsPage() {
  const { supabase } = await requireSession();
  const [{ data: stages }, { data: projects }] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Projets" description="Tous tes contenus, en cours et publiés." actions={<NewProjectButton stages={(stages ?? []) as Stage[]} />} />
      <ProjectList projects={(projects ?? []) as Project[]} stages={(stages ?? []) as Stage[]} />
    </div>
  );
}
