import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell";
import { requireSession } from "@/lib/session";
import type { Generation, Stage } from "@/lib/types";
import { StudioTabs } from "./studio";

export const metadata: Metadata = { title: "Studio IA" };

export default async function StudioPage() {
  const { supabase } = await requireSession();
  const [{ data: stages }, { data: branding }, { data: history }] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("position"),
    supabase.from("generations").select("output").eq("kind", "branding").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("generations").select("id, project_id, kind, input, output, credits_used, model, created_at").order("created_at", { ascending: false }).limit(30),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Studio IA" description="Trouve des idées, construis ton identité de chaîne et retrouve toutes tes générations." />
      <StudioTabs stages={(stages ?? []) as Stage[]} lastBranding={(branding?.output as never) ?? null} history={(history ?? []) as Generation[]} />
    </div>
  );
}
