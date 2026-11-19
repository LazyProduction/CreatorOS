"use server";

import { revalidatePath } from "next/cache";
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

const color = z.string().regex(/^#[0-9a-f]{6}$/i);

export async function createStage(name: string, stageColor: string) {
  const { supabase, user } = await userClient();
  const { data: last } = await supabase.from("pipeline_stages").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await supabase
    .from("pipeline_stages")
    .insert({ user_id: user.id, name: z.string().trim().min(1).max(40).parse(name), color: color.parse(stageColor), position: (last?.position ?? 0) + 1 })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  return data;
}

export async function updateStage(id: string, patch: { name?: string; color?: string; is_published_stage?: boolean }) {
  const { supabase } = await userClient();
  const data = z
    .object({ name: z.string().trim().min(1).max(40), color, is_published_stage: z.boolean() })
    .partial()
    .parse(patch);
  const { error } = await supabase.from("pipeline_stages").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
}

export async function deleteStage(id: string) {
  const { supabase } = await userClient();
  const { data: stages } = await supabase.from("pipeline_stages").select("id").order("position");
  if (!stages || stages.length <= 1) throw new Error("Garde au moins une étape.");
  const fallback = stages.find((s) => s.id !== id)!.id;
  await supabase.from("projects").update({ stage_id: fallback }).eq("stage_id", id);
  await supabase.from("pipeline_stages").delete().eq("id", id);
  revalidatePath("/pipeline");
}

export async function reorderStages(ids: string[]) {
  const { supabase } = await userClient();
  await Promise.all(ids.map((id, i) => supabase.from("pipeline_stages").update({ position: i }).eq("id", id)));
  revalidatePath("/pipeline");
}
