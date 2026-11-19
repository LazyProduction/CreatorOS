"use server";

import { revalidatePath } from "next/cache";
import { AIError, runGeneration } from "@/lib/ai/run";
import { isKind, type Kind, type KindOutput } from "@/lib/ai/kinds";

export type GenerateResult<K extends Kind> =
  | { ok: true; output: KindOutput<K>; creditsRemaining: number; demo: boolean }
  | { ok: false; error: string; code: string };

export async function generate<K extends Kind>(
  kind: K,
  args: { projectId?: string | null; theme?: string; extra?: string },
): Promise<GenerateResult<K>> {
  if (!isKind(kind)) return { ok: false, error: "Type de génération inconnu.", code: "invalid" };
  const theme = args.theme?.slice(0, 1000);
  const extra = args.extra?.slice(0, 2000);
  try {
    const res = await runGeneration(kind, { projectId: args.projectId ?? null, theme, extra });
    if (args.projectId) revalidatePath(`/projects/${args.projectId}`);
    return { ok: true, output: res.output, creditsRemaining: res.creditsRemaining, demo: res.demo };
  } catch (e) {
    if (e instanceof AIError) return { ok: false, error: e.message, code: e.code };
    console.error(e);
    return { ok: false, error: "Une erreur est survenue.", code: "unavailable" };
  }
}
