export const ACCENT_PRESETS = [
  { name: "Violet", value: "#8b5cf6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Bleu", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Émeraude", value: "#10b981" },
  { name: "Citron", value: "#a3e635" },
  { name: "Ambre", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Rouge", value: "#ef4444" },
  { name: "Rose", value: "#ec4899" },
  { name: "Mono", value: "#e4e4e7" },
] as const;

export const DEFAULT_ACCENT = "#8b5cf6";
export const THEME_STORAGE_KEY = "creatoros-theme";

export type ThemeMode = "dark" | "light";
export type ThemePrefs = { accent: string; mode: ThemeMode };

export function isHex(v: string) {
  return /^#[0-9a-f]{6}$/i.test(v);
}

/** Choisit un texte noir ou blanc lisible sur la couleur d'accent. */
export function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? "#0b0a10" : "#ffffff";
}

export function applyTheme(prefs: ThemePrefs) {
  const root = document.documentElement;
  const accent = isHex(prefs.accent) ? prefs.accent : DEFAULT_ACCENT;
  root.style.setProperty("--brand", accent);
  root.style.setProperty("--brand-fg", readableOn(accent));
  root.dataset.theme = prefs.mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ accent, mode: prefs.mode }));
  } catch {}
}

/** Script inline exécuté avant le rendu pour éviter le flash de thème. */
export const themeInitScript = `(function(){try{var t=JSON.parse(localStorage.getItem('${THEME_STORAGE_KEY}')||'null');if(!t)return;var r=document.documentElement;if(/^#[0-9a-f]{6}$/i.test(t.accent)){r.style.setProperty('--brand',t.accent);var n=parseInt(t.accent.slice(1),16),c=[(n>>16)&255,(n>>8)&255,n&255].map(function(x){x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4)});var l=0.2126*c[0]+0.7152*c[1]+0.0722*c[2];r.style.setProperty('--brand-fg',l>0.4?'#0b0a10':'#ffffff');}if(t.mode==='light'||t.mode==='dark')r.dataset.theme=t.mode;}catch(e){}})();`;
