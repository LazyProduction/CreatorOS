"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PubSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  platform: z.string().min(1).max(30),
  url: z.string().trim().max(500).optional().default(""),
  publishedAt: z.string().optional(),
  views: z.number().int().min(0).nullable().optional(),
  likes: z.number().int().min(0).nullable().optional(),
  comments: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(2000).optional().default(""),
});

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");
  return { supabase, user };
}

export async function addPublication(input: z.input<typeof PubSchema>) {
  const d = PubSchema.parse(input);
  const { supabase, user } = await userClient();
  const { error } = await supabase.from("publications").insert({
    user_id: user.id,
    project_id: d.projectId ?? null,
    platform: d.platform,
    url: d.url || null,
    published_at: d.publishedAt || new Date().toISOString(),
    views: d.views ?? null,
    likes: d.likes ?? null,
    comments: d.comments ?? null,
    notes: d.notes,
  });
  if (error) throw new Error(error.message);
  if (d.projectId) {
    await supabase
      .from("projects")
      .update({ published_at: d.publishedAt || new Date().toISOString(), ...(d.url ? { published_url: d.url } : {}) })
      .eq("id", d.projectId)
      .is("published_at", null);
    revalidatePath(`/projects/${d.projectId}`);
  }
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function updatePublicationStats(id: string, stats: { views?: number | null; likes?: number | null; comments?: number | null }) {
  const { supabase } = await userClient();
  const s = z
    .object({ views: z.number().int().min(0).nullable(), likes: z.number().int().min(0).nullable(), comments: z.number().int().min(0).nullable() })
    .partial()
    .parse(stats);
  await supabase.from("publications").update(s).eq("id", id);
  revalidatePath("/calendar");
}

export async function deletePublication(id: string) {
  const { supabase } = await userClient();
  await supabase.from("publications").delete().eq("id", id);
  revalidatePath("/calendar");
}

/** Partage une publication sur le serveur Discord du créateur via son webhook. */
export async function shareToDiscord(input: { message: string; url?: string }) {
  const { supabase, user } = await userClient();
  const { data: profile } = await supabase.from("profiles").select("discord_webhook_url, display_name").eq("id", user.id).single();
  const webhook = profile?.discord_webhook_url;
  if (!webhook || !/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\//.test(webhook)) {
    return { ok: false as const, error: "Ajoute d'abord ton webhook Discord dans les paramètres." };
  }
  const content = `${input.message.slice(0, 1800)}${input.url ? `\n${input.url}` : ""}`;
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content, username: profile?.display_name || "CreatorOS", allowed_mentions: { parse: [] } }),
  });
  if (!res.ok) return { ok: false as const, error: `Discord a refusé le message (${res.status}).` };
  return { ok: true as const };
}

