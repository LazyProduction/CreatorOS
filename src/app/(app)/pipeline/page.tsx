import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell";
import { NewProjectButton } from "@/components/new-project";
import { requireSession } from "@/lib/session";
import type { Project, Stage } from "@/lib/types";
import { Board } from "./board";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const { supabase } = await requireSession();
  const [{ data: stages }, { data: projects }] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase.from("projects").select("*").eq("archived", false).order("position"),
  ]);
  return (
    <>
      <PageHeader
        title="Pipeline de production"
        description="Glisse tes projets d'une étape à l'autre. Les étapes sont personnalisables."
        actions={<NewProjectButton stages={(stages ?? []) as Stage[]} />}
      />
      <Board initialStages={(stages ?? []) as Stage[]} initialProjects={(projects ?? []) as Project[]} />
    </>
  );
}
