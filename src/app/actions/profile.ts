"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ProfileSchema = z
  .object({
    display_name: z.string().trim().max(80),
    niche: z.string().trim().max(300),
    content_types: z.array(z.string().max(40)).max(10),
    platforms: z.array(z.string().max(30)).max(10),
    target_audience: z.string().trim().max(500),
    voice_notes: z.string().trim().max(1000),
    language: z.enum(["fr", "en"]),
    theme_accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    theme_mode: z.enum(["dark", "light"]),
    onboarded: z.boolean(),
    discord_webhook_url: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === "" || /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\//.test(v), "URL de webhook Discord invalide")
      .transform((v) => v || null)
      .nullable(),
  })
  .partial();

export async function updateProfile(patch: z.input<typeof ProfileSchema>) {
  const parsed = ProfileSchema.safeParse(patch);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Non connecté" };
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true as const };
}
