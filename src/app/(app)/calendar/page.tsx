import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell";
import { requireSession } from "@/lib/session";
import type { Project, Publication } from "@/lib/types";
import { CalendarView } from "./calendar";

export const metadata: Metadata = { title: "Calendrier" };

export default async function CalendarPage() {
  const { supabase } = await requireSession();
  const [{ data: projects }, { data: pubs }] = await Promise.all([
    supabase.from("projects").select("id, title, chosen_title, platform, format, publish_at, published_at, due_date").eq("archived", false),
    supabase.from("publications").select("*").order("published_at", { ascending: false }).limit(200),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Calendrier éditorial" description="Tes publications prévues et le suivi de ce qui est déjà en ligne." />
      <CalendarView projects={(projects ?? []) as Project[]} publications={(pubs ?? []) as Publication[]} />
    </div>
  );
}
