"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { ACCENT_PRESETS, applyTheme, isHex, type ThemeMode } from "@/lib/theme";
import { updateProfile } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

/** Synchronise le thème enregistré en base avec le navigateur. */
export function ThemeSync({ accent, mode }: { accent: string; mode: ThemeMode }) {
  useEffect(() => {
    applyTheme({ accent, mode });
  }, [accent, mode]);
  return null;
}

export function ThemeControls({ accent: initialAccent, mode: initialMode, compact }: { accent: string; mode: ThemeMode; compact?: boolean }) {
  const [accent, setAccent] = useState(initialAccent);
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [, start] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function update(next: { accent?: string; mode?: ThemeMode }) {
    const a = next.accent ?? accent;
    const m = next.mode ?? mode;
    setAccent(a);
    setMode(m);
    applyTheme({ accent: a, mode: m });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => start(() => void updateProfile({ theme_accent: a, theme_mode: m })), 400);
  }

  return (
    <div className="space-y-4">
      <div>
        {!compact && <p className="mb-2 text-xs font-medium text-muted">Couleur d'accent</p>}
        <div className={cn("flex flex-wrap", compact ? "gap-2.5" : "gap-3")}>
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              title={p.name}
              aria-label={p.name}
              onClick={() => update({ accent: p.value })}
              className={cn("relative flex items-center justify-center rounded-full transition hover:scale-110", compact ? "h-8 w-8" : "h-9 w-9")}
              style={{ background: p.value, boxShadow: accent.toLowerCase() === p.value ? `0 0 0 2px var(--bg), 0 0 0 4px ${p.value}` : undefined }}
            >
              {accent.toLowerCase() === p.value && <Check className="h-3.5 w-3.5" style={{ color: p.value === "#e4e4e7" || p.value === "#a3e635" ? "#000" : "#fff" }} />}
            </button>
          ))}
          <label
            title="Couleur personnalisée"
            className={cn("relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full transition hover:scale-110", compact ? "h-8 w-8" : "h-9 w-9")}
            style={{ background: "conic-gradient(from 0deg, #ef4444, #f59e0b, #a3e635, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)" }}
          >
            <input
              type="color"
              value={isHex(accent) ? accent : "#8b5cf6"}
              onChange={(e) => update({ accent: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Couleur personnalisée"
            />
          </label>
        </div>
      </div>
      <div>
        {!compact && <p className="mb-2 text-xs font-medium text-muted">Mode</p>}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface-2 p-1">
          {(["dark", "light"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ mode: m })}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition",
                mode === m ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
              )}
            >
              {m === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {m === "dark" ? "Sombre" : "Clair"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemePopover({ accent, mode }: { accent: string; mode: ThemeMode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
        aria-label="Changer les couleurs"
        title="Changer les couleurs"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="animate-fade-up absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-bg-elevated p-4 shadow-2xl">
            <p className="mb-3 text-sm font-semibold">Apparence</p>
            <ThemeControls accent={accent} mode={mode} compact />
          </div>
        </>
      )}
    </div>
  );
}
