export const PLATFORMS = [
  { key: "youtube", label: "YouTube", color: "#ff0033" },
  { key: "tiktok", label: "TikTok", color: "#25f4ee" },
  { key: "instagram", label: "Instagram", color: "#e1306c" },
  { key: "x", label: "X", color: "#a1a1aa" },
  { key: "linkedin", label: "LinkedIn", color: "#0a66c2" },
  { key: "twitch", label: "Twitch", color: "#9146ff" },
  { key: "podcast", label: "Podcast", color: "#f59e0b" },
] as const;

export type PlatformKey = (typeof PLATFORMS)[number]["key"];

export function platformLabel(key: string) {
  return PLATFORMS.find((p) => p.key === key)?.label ?? key;
}
export function platformColor(key: string) {
  return PLATFORMS.find((p) => p.key === key)?.color ?? "#a1a1aa";
}

export const FORMATS = [
  { key: "long", label: "Vidéo longue" },
  { key: "short", label: "Short / Reel / TikTok" },
  { key: "post", label: "Post texte" },
  { key: "live", label: "Live" },
] as const;

export function formatLabel(key: string) {
  return FORMATS.find((f) => f.key === key)?.label ?? key;
}

export const TONES = [
  { key: "dynamique", label: "Dynamique", hint: "Énergique, punchy, rythme rapide" },
  { key: "educatif", label: "Éducatif", hint: "Pédagogique, clair, par étapes" },
  { key: "storytelling", label: "Storytelling", hint: "Narratif, immersif, émotion" },
  { key: "humour", label: "Humour", hint: "Décalé, second degré, punchlines" },
  { key: "serieux", label: "Sérieux", hint: "Posé, factuel, précis" },
  { key: "vlog", label: "Vlog / IRL", hint: "Spontané, chaleureux, adresse directe" },
] as const;

export const CONTENT_TYPES = [
  "Gaming",
  "Tech",
  "Éducation",
  "Humour",
  "Vlog",
  "Lifestyle",
  "Beauté / Mode",
  "Sport / Fitness",
  "Cuisine",
  "Business / Finance",
  "Musique",
  "Voyage",
  "Science",
  "Cinéma / Séries",
  "Autre",
];
