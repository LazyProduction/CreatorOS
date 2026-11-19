import { z } from "zod";

/**
 * Chaque type de génération : coût en crédits, modèle (rapide / intelligent), schéma de sortie.
 * Les coûts sont calibrés pour garder une marge confortable (voir docs/PRICING.md).
 */

export const IdeasOutput = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe("Titre de travail concret et accrocheur"),
        angle: z.string().describe("L'angle unique de la vidéo en une phrase"),
        format: z.enum(["long", "short", "post", "live"]),
        hook: z.string().describe("Première phrase prononcée face caméra"),
      }),
    )
    .describe("8 idées variées"),
});

export const TitlesOutput = z.object({
  titles: z.array(
    z.object({
      title: z.string(),
      why: z.string().describe("Pourquoi ce titre donne envie de cliquer, en une phrase courte"),
    }),
  ),
});

export const HooksOutput = z.object({
  hooks: z.array(
    z.object({
      hook: z.string().describe("Le hook tel qu'il sera prononcé (1 à 3 phrases)"),
      style: z.string().describe("Style : question, affirmation choc, situation, défi, chiffre, histoire..."),
    }),
  ),
});

export const DescriptionOutput = z.object({
  description: z.string().describe("Description optimisée, prête à coller, avec appel à l'action"),
  chapters: z
    .array(z.object({ time: z.string(), label: z.string() }))
    .describe("Chapitres proposés (vide si non pertinent)"),
});

export const TagsOutput = z.object({
  tags: z.array(z.string()).describe("Tags YouTube sans #, du plus précis au plus large"),
  hashtags: z.array(z.string()).describe("3 à 5 hashtags avec #"),
});

export const ScriptOutput = z.object({
  script: z.string().describe("Script complet en Markdown, prêt à lire au téléprompteur"),
  duration_estimate: z.string().describe("Durée estimée à l'oral, ex : 8 min"),
});

export const PromoOutput = z.object({
  posts: z.array(z.object({ platform: z.string(), text: z.string() })),
});

export const KitOutput = z.object({
  titles: TitlesOutput.shape.titles,
  hooks: HooksOutput.shape.hooks,
  description: z.string(),
  tags: z.array(z.string()),
  hashtags: z.array(z.string()),
  posts: PromoOutput.shape.posts,
  thumbnail_ideas: z.array(
    z.object({ text: z.string().describe("Texte court sur la miniature (3 à 5 mots)"), visual: z.string() }),
  ),
});

export const BrandingOutput = z.object({
  channel_names: z.array(z.object({ name: z.string(), why: z.string() })),
  slogan: z.string(),
  bio_short: z.string().describe("Bio de 150 caractères max pour TikTok/Instagram/X"),
  bio_long: z.string().describe("Description de chaîne YouTube"),
  tone_of_voice: z.string(),
  content_pillars: z.array(z.object({ name: z.string(), description: z.string() })),
  palette: z.array(z.object({ name: z.string(), hex: z.string().describe("Couleur au format #RRGGBB") })),
  fonts: z.object({ title: z.string(), body: z.string() }),
  banner_text: z.string(),
  logo_prompt: z.string().describe("Prompt détaillé (en anglais) pour générer le logo avec une IA d'image"),
  avatar_prompt: z.string().describe("Prompt détaillé (en anglais) pour générer la photo de profil / avatar"),
});

export type Tier = "fast" | "smart";

export const KINDS = {
  ideas: { label: "Idées de vidéos", credits: 1, tier: "fast", schema: IdeasOutput, maxTokens: 4000 },
  titles: { label: "Titres", credits: 1, tier: "fast", schema: TitlesOutput, maxTokens: 3000 },
  hooks: { label: "Hooks", credits: 1, tier: "fast", schema: HooksOutput, maxTokens: 3000 },
  description: { label: "Description SEO", credits: 1, tier: "fast", schema: DescriptionOutput, maxTokens: 4000 },
  tags: { label: "Tags", credits: 1, tier: "fast", schema: TagsOutput, maxTokens: 2000 },
  promo: { label: "Posts de promotion", credits: 1, tier: "fast", schema: PromoOutput, maxTokens: 4000 },
  script: { label: "Script", credits: 3, tier: "smart", schema: ScriptOutput, maxTokens: 16000 },
  kit: { label: "Kit vidéo complet", credits: 4, tier: "smart", schema: KitOutput, maxTokens: 12000 },
  branding: { label: "Branding de chaîne", credits: 3, tier: "smart", schema: BrandingOutput, maxTokens: 8000 },
} as const satisfies Record<string, { label: string; credits: number; tier: Tier; schema: z.ZodType; maxTokens: number }>;

export type Kind = keyof typeof KINDS;
export type KindOutput<K extends Kind> = z.infer<(typeof KINDS)[K]["schema"]>;

export function isKind(v: string): v is Kind {
  return v in KINDS;
}
