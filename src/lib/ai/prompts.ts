import type { Profile, Project } from "@/lib/types";
import { formatLabel, platformLabel, TONES } from "@/lib/platforms";
import type { Kind } from "./kinds";

/** Partie stable du prompt système (mise en cache côté Anthropic). */
export const BASE_SYSTEM = `Tu es le co-scénariste et stratège de contenu de CreatorOS. Tu travailles pour des créateurs de tous les univers : gaming, tech, éducation, humour, vlog, lifestyle, beauté, sport, cuisine, business, musique, science, et d'autres.

Ta règle d'or : tu écris comme un créateur respecté de LA communauté du créateur, pas comme un consultant marketing. Tu reprends ses codes, son vocabulaire, ses références et son niveau de langage. Un créateur gaming parle de mécaniques, de patchs, de moments de game ; un créateur cuisine parle de textures, de gestes et d'erreurs classiques ; un créateur business parle de chiffres qu'il a vécus.

Principes :
- Chaque proposition est ancrée dans un détail précis du sujet (un moment, une mécanique, un objet, une erreur, une émotion). Jamais de généralités interchangeables.
- N'invente jamais de statistiques, de chiffres, de résultats ou de citations. Si un chiffre serait utile, laisse un emplacement entre crochets, par exemple [ton chiffre].
- Pas de formules creuses : « Dans cette vidéo », « Tu ne vas pas le croire », « Le secret que personne ne te dit », « Incroyable », « Révolutionnaire ».
- Varie réellement les angles et les styles d'une proposition à l'autre.
- Respecte les codes de chaque plateforme : un titre YouTube n'est pas un post LinkedIn.
- Écris dans la langue demandée, avec un ton naturel et oral quand c'est prononcé face caméra.`;

const TASKS: Record<Kind, string> = {
  ideas:
    "Propose 8 idées de contenus variées autour de la thématique donnée. Mélange les formats (vidéos longues, shorts, posts) selon les plateformes du créateur. Chaque idée a un angle précis qui la distingue des milliers de vidéos déjà existantes sur le sujet.",
  titles:
    "Propose 6 titres pour ce projet. Varie les mécaniques : curiosité, enjeu personnel, défi, contraste, liste, question, résultat. Respecte la limite de la plateforme (moins de 70 caractères pour YouTube). Le titre doit être honnête vis-à-vis du contenu.",
  hooks:
    "Propose 6 hooks d'ouverture (les 3 à 8 premières secondes). Styles différents : question, affirmation choc, situation concrète, défi, mini-histoire, contre-intuition. Chacun doit donner une raison immédiate de rester et teaser le résultat final.",
  description:
    "Rédige la description de la publication, optimisée pour la recherche : première ligne accrocheuse qui reprend le mot-clé principal, 2 à 4 paragraphes courts avec des mots-clés naturels, un appel à l'action clair, et des emplacements entre crochets pour les liens. Propose des chapitres seulement si c'est une vidéo longue et que le script ou le brief permet de les déduire, sinon renvoie une liste vide.",
  tags:
    "Propose 15 à 25 tags YouTube (sans #), du plus spécifique au plus large, incluant les variantes de recherche réelles que taperait l'audience, puis 3 à 5 hashtags pertinents.",
  promo:
    "Rédige un post de promotion pour CHACUNE des plateformes du créateur (sauf la plateforme principale de publication si c'est une vidéo YouTube : propose alors un post communauté YouTube). Respecte les codes de chaque réseau : LinkedIn aéré avec une accroche forte, X en moins de 280 caractères, Instagram et TikTok avec une légende courte et des hashtags, Discord avec un ton communauté. Mets [lien] là où le lien doit apparaître.",
  script:
    "Rédige le script complet, prêt à être lu au téléprompteur. Structure : ## HOOK (0:00), ## INTRO, puis des parties ## avec des titres explicites, et ## CONCLUSION + appel à l'action. Phrases courtes, rythme oral, relances régulières pour garder l'attention. Indique les plans de coupe entre crochets, par exemple [B-roll : ...] ou [Écran : ...]. Adapte la longueur au format : environ 150 mots pour un short, 1 200 à 2 000 mots pour une vidéo longue.",
  kit:
    "Produis un kit de publication complet pour ce projet : 5 titres, 5 hooks, la description optimisée, 15 à 25 tags, 3 à 5 hashtags, un post de promotion pour chaque plateforme du créateur, et 3 concepts de miniature (texte court + description visuelle).",
  branding:
    "Construis l'identité de marque complète du créateur : 6 idées de noms de chaîne (ou des déclinaisons s'il a déjà un nom), un slogan, une bio courte, une description de chaîne, le ton de voix, 3 à 5 piliers de contenu, une palette de 5 couleurs cohérente avec sa niche (format #RRGGBB), une paire de polices Google Fonts, un texte de bannière, et des prompts d'image détaillés en anglais pour le logo et l'avatar.",
};

export function creatorContext(profile: Profile): string {
  const lines = [
    `Nom : ${profile.display_name || "non précisé"}`,
    `Univers : ${profile.content_types.length ? profile.content_types.join(", ") : "non précisé"}`,
    `Niche : ${profile.niche?.trim() || "non précisée (reste concret)"}`,
    `Plateformes : ${(profile.platforms.length ? profile.platforms : ["youtube"]).map(platformLabel).join(", ")}`,
  ];
  if (profile.target_audience?.trim()) lines.push(`Audience : ${profile.target_audience.trim()}`);
  if (profile.voice_notes?.trim()) lines.push(`Style et voix : ${profile.voice_notes.trim()}`);
  lines.push(`Langue de sortie : ${profile.language === "en" ? "anglais" : "français"}`);
  return `<profil_createur>\n${lines.join("\n")}\n</profil_createur>`;
}

export function projectContext(project: Project): string {
  const tone = TONES.find((t) => t.key === project.tone);
  const lines = [
    `Titre de travail : ${project.chosen_title || project.title}`,
    `Plateforme principale : ${platformLabel(project.platform)}`,
    `Format : ${formatLabel(project.format)}`,
    `Ton : ${tone ? `${tone.label} (${tone.hint})` : project.tone}`,
  ];
  if (project.brief.trim()) lines.push(`Brief / idée :\n${project.brief.trim()}`);
  if (project.chosen_hook) lines.push(`Hook retenu : ${project.chosen_hook}`);
  if (project.script.trim()) lines.push(`Script actuel :\n${project.script.trim().slice(0, 12000)}`);
  return `<projet>\n${lines.join("\n")}\n</projet>`;
}

export function buildUserPrompt(
  kind: Kind,
  args: { profile: Profile; project?: Project | null; theme?: string; extra?: string },
): string {
  const parts = [creatorContext(args.profile)];
  if (args.project) parts.push(projectContext(args.project));
  if (args.theme) parts.push(`<thematique>\n${args.theme}\n</thematique>`);
  if (args.extra?.trim()) parts.push(`<consignes_supplementaires>\n${args.extra.trim()}\n</consignes_supplementaires>`);
  parts.push(`<tache>\n${TASKS[kind]}\n</tache>`);
  return parts.join("\n\n");
}
