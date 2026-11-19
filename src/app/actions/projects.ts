"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");
  return { supabase, user };
}

const CreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  brief: z.string().max(5000).optional().default(""),
  platform: z.string().max(30).optional().default("youtube"),
  format: z.enum(["long", "short", "post", "live"]).optional().default("long"),
  tone: z.string().max(30).optional().default("dynamique"),
  stageId: z.string().uuid().optional().nullable(),
  publishAt: z.string().optional().nullable(),
});

export async function createProject(input: z.input<typeof CreateSchema>, opts?: { redirectTo?: boolean }) {
  const data = CreateSchema.parse(input);
  const { supabase, user } = await userClient();

  let stageId = data.stageId ?? null;
  if (!stageId) {
    const { data: first } = await supabase.from("pipeline_stages").select("id").order("position").limit(1).maybeSingle();
    stageId = first?.id ?? null;
  }
  const { data: last } = await supabase
    .from("projects")
    .select("position")
    .eq("stage_id", stageId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: data.title,
      brief: data.brief,
      platform: data.platform,
      format: data.format,
      tone: data.tone,
      stage_id: stageId,
      position: (last?.position ?? 0) + 1024,
      publish_at: data.publishAt || null,
      checklist: [
        { id: "c1", label: "Script finalisé", done: false },
        { id: "c2", label: "Tournage", done: false },
        { id: "c3", label: "Montage", done: false },
        { id: "c4", label: "Miniature", done: false },
        { id: "c5", label: "Titre, description et tags", done: false },
      ],
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  if (opts?.redirectTo) redirect(`/projects/${project.id}`);
  return project.id as string;
}

const UpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    brief: z.string().max(5000),
    platform: z.string().max(30),
    format: z.enum(["long", "short", "post", "live"]),
    tone: z.string().max(30),
    chosen_title: z.string().max(300).nullable(),
    chosen_hook: z.string().max(2000).nullable(),
    script: z.string().max(100000),
    description: z.string().max(10000),
    tags: z.array(z.string().max(100)).max(60),
    notes: z.string().max(20000),
    checklist: z.array(z.object({ id: z.string(), label: z.string().max(200), done: z.boolean() })).max(50),
    due_date: z.string().nullable(),
    publish_at: z.string().nullable(),
    published_url: z.string().max(500).nullable(),
    stage_id: z.string().uuid().nullable(),
    archived: z.boolean(),
  })
  .partial();

export async function updateProject(id: string, patch: z.input<typeof UpdateSchema>) {
  const data = UpdateSchema.parse(patch);
  const { supabase } = await userClient();
  const { error } = await supabase.from("projects").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteProject(id: string) {
  const { supabase } = await userClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/pipeline");
  revalidatePath("/projects");
  redirect("/pipeline");
}

export async function moveProject(id: string, stageId: string, position: number) {
  const { supabase } = await userClient();
  const { error } = await supabase.rpc("move_project", { p_project: id, p_stage: stageId, p_position: position });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  return { ok: true };
}
