import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, Project } from "@/lib/types";
import { KINDS, type Kind, type KindOutput } from "./kinds";
import { BASE_SYSTEM, buildUserPrompt } from "./prompts";
import { demoOutput } from "./demo";

export class AIError extends Error {
  constructor(
    message: string,
    public code: "unauthenticated" | "insufficient_credits" | "unavailable" | "refused" | "invalid" = "unavailable",
  ) {
    super(message);
  }
}

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic({ maxRetries: 2, timeout: 120_000 });
  return client;
}

function modelFor(kind: Kind) {
  return KINDS[kind].tier === "smart"
    ? process.env.AI_MODEL_SMART || "claude-sonnet-5-5"
    : process.env.AI_MODEL_FAST || "claude-haiku-5-5";
}

export const isDemoMode = () => process.env.AI_DEMO_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

type RunArgs = {
  projectId?: string | null;
  theme?: string;
  extra?: string;
};

export type RunResult<K extends Kind> = {
  output: KindOutput<K>;
  creditsRemaining: number;
  generationId: string | null;
  demo: boolean;
};

/**
 * Exécute une génération IA : vérifie l'utilisateur, débite les crédits de façon atomique,
 * appelle Claude avec une sortie structurée, enregistre l'historique, rembourse en cas d'échec.
 */
export async function runGeneration<K extends Kind>(kind: K, args: RunArgs): Promise<RunResult<K>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AIError("Connecte-toi pour utiliser l'IA.", "unauthenticated");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) throw new AIError("Profil introuvable.", "invalid");

  let project: Project | null = null;
  if (args.projectId) {
    const { data } = await supabase.from("projects").select("*").eq("id", args.projectId).single<Project>();
    if (!data) throw new AIError("Projet introuvable.", "invalid");
    project = data;
  }

  const def = KINDS[kind];
  const demo = isDemoMode();
  const admin = createAdminClient();

  let output: KindOutput<K>;
  let creditsRemaining: number;
  let usage: { input_tokens: number; output_tokens: number } | null = null;
  const model = demo ? "demo" : modelFor(kind);

  if (demo) {
    output = demoOutput(kind, project?.chosen_title || project?.title || args.theme || profile.niche || "");
    const { data } = await supabase.rpc("get_credits");
    creditsRemaining = (data as number | null) ?? 0;
  } else {
    const { data: remaining, error } = await supabase.rpc("consume_credits", { p_amount: def.credits });
    if (error) throw new AIError("Impossible de débiter les crédits, réessaie.", "unavailable");
    if (remaining === null) {
      throw new AIError(`Il te faut ${def.credits} crédit${def.credits > 1 ? "s" : ""} pour cette génération.`, "insufficient_credits");
    }
    creditsRemaining = remaining as number;

    try {
      const response = await anthropic().messages.parse({
        model,
        max_tokens: def.maxTokens,
        system: [{ type: "text", text: BASE_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: buildUserPrompt(kind, { profile, project, theme: args.theme, extra: args.extra }) }],
        output_config: {
          format: zodOutputFormat(def.schema),
          effort: def.tier === "smart" ? "medium" : "low",
        },
      });

      if (response.stop_reason === "refusal") {
        throw new AIError("L'IA a refusé cette demande. Reformule ton sujet.", "refused");
      }
      if (!response.parsed_output) {
        throw new AIError(
          response.stop_reason === "max_tokens" ? "La réponse était trop longue, réessaie." : "Réponse IA invalide, réessaie.",
          "invalid",
        );
      }
      output = response.parsed_output as KindOutput<K>;
      usage = { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens };
    } catch (err) {
      // Rembourse les crédits si l'IA n'a rien produit.
      await admin.rpc("refund_credits", { p_user: user.id, p_amount: def.credits });
      if (err instanceof AIError) throw err;
      console.error("[ai] generation failed", kind, err);
      throw new AIError("Le service IA est momentanément indisponible. Tes crédits ont été remboursés.", "unavailable");
    }
  }

  const { data: gen } = await admin
    .from("generations")
    .insert({
      user_id: user.id,
      project_id: project?.id ?? null,
      kind,
      input: { theme: args.theme ?? null, extra: args.extra ?? null },
      output,
      credits_used: demo ? 0 : def.credits,
      model,
      input_tokens: usage?.input_tokens ?? null,
      output_tokens: usage?.output_tokens ?? null,
    })
    .select("id")
    .single();

  return { output, creditsRemaining, generationId: gen?.id ?? null, demo };
}
