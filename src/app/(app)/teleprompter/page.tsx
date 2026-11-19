import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { Teleprompter } from "./teleprompter";

export const metadata: Metadata = { title: "Téléprompteur" };

export default async function TeleprompterPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: projectId } = await searchParams;
  const { supabase } = await requireSession();
  const { data: projects } = await supabase.from("projects").select("id, title, chosen_title, script").neq("script", "").order("updated_at", { ascending: false }).limit(50);
  const list = (projects ?? []).map((p) => ({ id: p.id as string, title: (p.chosen_title || p.title) as string, script: p.script as string }));
  return <Teleprompter projects={list} initialProjectId={projectId && list.some((p) => p.id === projectId) ? projectId : null} />;
}
