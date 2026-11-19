import type { Kind, KindOutput } from "./kinds";

/** Réponses d'exemple utilisées quand AI_DEMO_MODE=true (aucun appel API, aucun crédit débité). */
export function demoOutput<K extends Kind>(kind: K, subject: string): KindOutput<K> {
  const s = subject || "ton sujet";
  const outputs: { [P in Kind]: KindOutput<P> } = {
    ideas: {
      ideas: [
        { title: `J'ai testé ${s} pendant 7 jours`, angle: "Journal de bord honnête, avec les ratés", format: "long", hook: "Jour 1, j'ai failli tout arrêter." },
        { title: `L'erreur que tout le monde fait avec ${s}`, angle: "Corriger une idée reçue précise", format: "short", hook: "Si tu fais ça, arrête tout de suite." },
        { title: `${s} : ce que j'aurais aimé savoir avant`, angle: "Conseils de quelqu'un qui est passé par là", format: "long", hook: "Il y a un an, j'étais exactement à ta place." },
        { title: `Je classe chaque option de ${s}`, angle: "Tier list argumentée", format: "long", hook: "Celui-là, personne n'ose le mettre en bas." },
        { title: `${s} en 60 secondes`, angle: "Version ultra condensée", format: "short", hook: "Tout ce qu'il faut savoir, chrono lancé." },
        { title: `Pourquoi j'ai changé d'avis sur ${s}`, angle: "Retournement personnel", format: "post", hook: "J'avais tort, et je vais t'expliquer pourquoi." },
        { title: `Défi : ${s} avec zéro budget`, angle: "Contrainte forte", format: "long", hook: "0 €, 48 heures, une seule règle." },
        { title: `On en parle en live : ${s}`, angle: "Questions de la communauté", format: "live", hook: "Ce soir, c'est vous qui décidez." },
      ],
    },
    titles: {
      titles: [
        { title: `J'ai testé ${s} pendant 7 jours (honnêtement)`, why: "Enjeu personnel et promesse de transparence." },
        { title: `Personne ne parle de ce détail de ${s}`, why: "Curiosité, sans promesse exagérée." },
        { title: `${s} : la vraie méthode étape par étape`, why: "Clair et orienté recherche." },
        { title: `J'ai fait l'erreur pour que tu ne la fasses pas`, why: "Empathie et apprentissage." },
        { title: `${s}, ça vaut encore le coup ?`, why: "Question qui suscite le débat." },
        { title: `De débutant à confirmé sur ${s}`, why: "Arc de progression visible." },
      ],
    },
    hooks: {
      hooks: [
        { hook: `Tu penses connaître ${s} ? Regarde bien ce qui se passe à la troisième étape.`, style: "Question" },
        { hook: "J'ai perdu une semaine entière à cause d'un seul réglage. Voici lequel.", style: "Situation" },
        { hook: `${s}, tout le monde le fait mal. Moi le premier.`, style: "Affirmation choc" },
        { hook: "Je te mets au défi de tenir jusqu'à la fin sans changer d'avis.", style: "Défi" },
        { hook: "Il était 3 heures du matin quand j'ai enfin compris.", style: "Mini-histoire" },
        { hook: "Plus tu en fais, moins ça marche. Je t'explique.", style: "Contre-intuition" },
      ],
    },
    description: {
      description: `${s} : je te montre tout, étape par étape, avec mes erreurs et ce qui a vraiment marché.\n\nDans ce contenu, on voit pourquoi la plupart des gens bloquent au même endroit, et comment l'éviter avec une méthode simple.\n\nAbonne-toi pour ne pas rater la suite, et dis-moi en commentaire ce que tu veux voir ensuite.\n\n🔗 Liens utiles : [lien]\n📩 Contact : [email]`,
      chapters: [
        { time: "0:00", label: "Introduction" },
        { time: "1:12", label: "L'erreur classique" },
        { time: "4:30", label: "La méthode" },
        { time: "9:05", label: "Résultat et conclusion" },
      ],
    },
    tags: {
      tags: [s, `${s} tuto`, `${s} débutant`, `${s} astuces`, `${s} 2026`, "tutoriel", "conseils", "méthode", "erreurs à éviter", "guide complet"],
      hashtags: ["#créateur", "#tuto", "#astuce"],
    },
    promo: {
      posts: [
        { platform: "youtube", text: `Nouvelle vidéo en ligne : ${s}. Dites-moi en commentaire si vous aviez déjà fait cette erreur 👇 [lien]` },
        { platform: "x", text: `J'ai passé 7 jours sur ${s}. Le jour 3 a tout changé. La vidéo complète : [lien]` },
        { platform: "linkedin", text: `J'ai fait une erreur avec ${s}.\n\nEt elle m'a appris plus que tout le reste.\n\nJe raconte tout ici : [lien]` },
      ],
    },
    script: {
      script: `## HOOK (0:00)\nTu penses connaître ${s} ? Moi aussi, jusqu'à la semaine dernière.\n\n## INTRO\nAujourd'hui, je te montre exactement ce qui a marché, et surtout ce qui n'a pas marché.\n[B-roll : plan sur le setup]\n\n## PARTIE 1 : L'erreur classique\nLa première chose que tout le monde fait, c'est foncer tête baissée.\nRésultat : on perd du temps et on abandonne.\n\n## PARTIE 2 : La méthode\nÉtape une : on simplifie.\nÉtape deux : on teste petit.\nÉtape trois : on garde uniquement ce qui marche.\n\n## CONCLUSION\nSi tu ne retiens qu'une chose : commence petit, mais commence aujourd'hui.\nAbonne-toi, et dis-moi en commentaire ce que tu veux voir ensuite.`,
      duration_estimate: "2 min",
    },
    kit: {
      titles: [
        { title: `J'ai testé ${s} pendant 7 jours`, why: "Enjeu personnel." },
        { title: `L'erreur que tout le monde fait avec ${s}`, why: "Curiosité." },
        { title: `${s} : la méthode simple`, why: "Recherche." },
        { title: `${s}, ça vaut le coup ?`, why: "Débat." },
        { title: `Ce que personne ne dit sur ${s}`, why: "Révélation." },
      ],
      hooks: [
        { hook: "Jour 1, j'ai failli tout arrêter.", style: "Situation" },
        { hook: `Tout le monde fait ${s} de travers.`, style: "Affirmation choc" },
        { hook: "Et si tu faisais l'inverse ?", style: "Question" },
        { hook: "Je te mets au défi de rester jusqu'au bout.", style: "Défi" },
        { hook: "3 heures du matin, et enfin le déclic.", style: "Histoire" },
      ],
      description: `${s} : tout ce que j'ai appris en 7 jours, sans filtre.\n\nAbonne-toi pour la suite. [lien]`,
      tags: [s, `${s} tuto`, `${s} débutant`, "conseils", "méthode"],
      hashtags: ["#créateur", "#tuto"],
      posts: [
        { platform: "x", text: `7 jours sur ${s}. Le jour 3 a tout changé. [lien]` },
        { platform: "linkedin", text: `J'ai fait une erreur avec ${s}. Voici ce qu'elle m'a appris. [lien]` },
      ],
      thumbnail_ideas: [
        { text: "J'AVAIS TORT", visual: "Gros plan visage surpris, fond uni de la couleur d'accent." },
        { text: "7 JOURS", visual: "Avant / après côte à côte avec une flèche." },
        { text: "NE FAIS PAS ÇA", visual: "Objet barré d'une croix rouge, regard caméra." },
      ],
    },
    branding: {
      channel_names: [
        { name: "Le Labo Créatif", why: "Évoque l'expérimentation." },
        { name: "Plan B Studio", why: "Court et mémorable." },
        { name: "Mode Turbo", why: "Énergie et rythme." },
        { name: "Hors Cadre", why: "Promesse d'originalité." },
        { name: "Le Carnet", why: "Proximité et authenticité." },
        { name: "Signal", why: "Clair, moderne, international." },
      ],
      slogan: "On teste, on rate, on apprend.",
      bio_short: `Je teste ${s} pour que tu n'aies pas à le faire. Nouvelle vidéo chaque semaine.`,
      bio_long: `Bienvenue ! Ici on parle de ${s} sans filtre : des tests honnêtes, des méthodes simples et beaucoup d'erreurs assumées. Nouvelle vidéo chaque semaine.`,
      tone_of_voice: "Direct, chaleureux, autodérision, phrases courtes.",
      content_pillars: [
        { name: "Tests", description: "Je teste et je donne mon avis honnête." },
        { name: "Méthodes", description: "Des tutos étape par étape." },
        { name: "Coulisses", description: "Les ratés et l'envers du décor." },
      ],
      palette: [
        { name: "Encre", hex: "#0f0d1a" },
        { name: "Accent", hex: "#8b5cf6" },
        { name: "Lumière", hex: "#f4f3f8" },
        { name: "Énergie", hex: "#f59e0b" },
        { name: "Calme", hex: "#22c55e" },
      ],
      fonts: { title: "Space Grotesk", body: "Inter" },
      banner_text: "Nouvelle vidéo chaque mardi",
      logo_prompt: "Minimalist flat vector logo, bold geometric monogram, purple and off-white, clean negative space, YouTube channel brand, no text",
      avatar_prompt: "Friendly creator portrait, soft studio lighting, purple gradient background, high detail, centered, square crop",
    },
  };
  return outputs[kind] as KindOutput<K>;
}
