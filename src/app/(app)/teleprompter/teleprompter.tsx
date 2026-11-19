"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FlipHorizontal2, Maximize2, Minimize2, Minus, Pause, Play, Plus, RotateCcw, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type P = { id: string; title: string; script: string };
const STORAGE = "creatoros-teleprompter";

/** Transforme le script Markdown en blocs lisibles : titres atténués, indications [..] en italique. */
function toBlocks(text: string) {
  return text
    .split(/\n{1,}/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^#{1,6}\s/.test(line)) return { type: "heading" as const, text: line.replace(/^#{1,6}\s*/, "") };
      if (/^\[.*\]$/.test(line)) return { type: "cue" as const, text: line.slice(1, -1) };
      return { type: "line" as const, text: line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^[-*]\s+/, "") };
    });
}

export function Teleprompter({ projects, initialProjectId }: { projects: P[]; initialProjectId: string | null }) {
  const [projectId, setProjectId] = useState<string>(initialProjectId ?? "");
  const [custom, setCustom] = useState("");
  const [speed, setSpeed] = useState(3); // 1 à 10
  const [fontSize, setFontSize] = useState(44);
  const [width, setWidth] = useState(75); // % de largeur
  const [mirror, setMirror] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const acc = useRef<number>(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) ?? "{}");
      if (saved.custom) setCustom(saved.custom);
      if (saved.speed) setSpeed(saved.speed);
      if (saved.fontSize) setFontSize(saved.fontSize);
      if (saved.width) setWidth(saved.width);
      if (typeof saved.mirror === "boolean") setMirror(saved.mirror);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ custom, speed, fontSize, width, mirror }));
    } catch {}
  }, [custom, speed, fontSize, width, mirror]);

  const text = projectId ? projects.find((p) => p.id === projectId)?.script ?? "" : custom;
  const blocks = useMemo(() => toBlocks(text), [text]);

  const tick = useCallback(
    (t: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const dt = last.current ? (t - last.current) / 1000 : 0;
      last.current = t;
      acc.current += dt * speed * 14 * (fontSize / 44);
      if (acc.current >= 1) {
        const step = Math.floor(acc.current);
        el.scrollTop += step;
        acc.current -= step;
      }
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 0);
      if (el.scrollTop >= max - 1) {
        setPlaying(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    },
    [speed, fontSize],
  );

  useEffect(() => {
    if (!playing) return;
    last.current = 0;
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, tick]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setPlaying(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 800);
    return () => clearTimeout(id);
  }, [countdown]);

  const toggle = useCallback(() => {
    if (playing) setPlaying(false);
    else if (countdown === null) setCountdown(3);
  }, [playing, countdown]);

  const reset = () => {
    setPlaying(false);
    setCountdown(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setProgress(0);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await stageRef.current?.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSpeed((s) => Math.min(10, s + 0.5));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSpeed((s) => Math.max(0.5, s - 0.5));
      } else if (e.key === "ArrowLeft" && scrollRef.current) scrollRef.current.scrollTop -= 120;
      else if (e.key === "ArrowRight" && scrollRef.current) scrollRef.current.scrollTop += 120;
      else if (e.key.toLowerCase() === "f") void toggleFullscreen();
      else if (e.key.toLowerCase() === "m") setMirror((m) => !m);
      else if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Téléprompteur"
        description="Espace : lecture / pause · ↑ ↓ : vitesse · ← → : reculer / avancer · F : plein écran · M : miroir · R : recommencer"
      />
      <div className={cn("grid gap-5", showSettings && "lg:grid-cols-[300px_1fr]")}>
        {showSettings && (
          <Card className="space-y-4 self-start">
            <div>
              <Label htmlFor="tp-source">Texte</Label>
              <Select id="tp-source" value={projectId} onChange={(e) => { setProjectId(e.target.value); reset(); }}>
                <option value="">Texte libre</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </div>
            {!projectId && (
              <Textarea value={custom} onChange={(e) => setCustom(e.target.value)} className="min-h-40 text-xs" placeholder="Colle ton script ici…" aria-label="Texte libre" />
            )}
            {projectId && (
              <Link href={`/projects/${projectId}`} className="block text-xs text-brand-text hover:underline">
                Modifier le script du projet
              </Link>
            )}
            <Range label="Vitesse" value={speed} min={0.5} max={10} step={0.5} onChange={setSpeed} display={`${speed}`} />
            <Range label="Taille du texte" value={fontSize} min={24} max={96} step={2} onChange={setFontSize} display={`${fontSize}px`} />
            <Range label="Largeur" value={width} min={40} max={100} step={5} onChange={setWidth} display={`${width}%`} />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} className="accent-[var(--brand)]" />
              Mode miroir (pour un prompteur à vitre)
            </label>
            <p className="text-xs text-subtle">
              {words} mots · environ {Math.max(1, Math.round(words / 150))} min à l'oral
            </p>
          </Card>
        )}

        <div ref={stageRef} className={cn("relative overflow-hidden rounded-2xl border border-line bg-black", fullscreen ? "rounded-none border-0" : "h-[70vh]")}>
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-white/10">
            <div className="h-full bg-brand transition-[width]" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[33%] z-10 h-px bg-brand/60 shadow-[0_0_12px_var(--brand)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-black to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-t from-black to-transparent" />

          <div ref={scrollRef} className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={toggle}>
            <div className="mx-auto pt-[33vh] pb-[70vh]" style={{ width: `${width}%`, transform: mirror ? "scaleX(-1)" : undefined }}>
              {blocks.length ? (
                blocks.map((b, i) =>
                  b.type === "heading" ? (
                    <p key={i} className="mt-[1.2em] mb-[0.4em] font-display font-semibold tracking-wide text-white/35 uppercase" style={{ fontSize: fontSize * 0.45 }}>
                      {b.text}
                    </p>
                  ) : b.type === "cue" ? (
                    <p key={i} className="my-[0.4em] text-white/40 italic" style={{ fontSize: fontSize * 0.45 }}>
                      {b.text}
                    </p>
                  ) : (
                    <p key={i} className="mb-[0.6em] leading-[1.35] font-semibold text-white" style={{ fontSize }}>
                      {b.text}
                    </p>
                  ),
                )
              ) : (
                <p className="text-center text-white/40" style={{ fontSize: 22 }}>
                  Choisis un projet ou colle ton texte pour commencer.
                </p>
              )}
            </div>
          </div>

          {countdown !== null && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
              <span key={countdown} className="animate-fade-up font-display text-[8rem] font-bold text-white">
                {countdown || ""}
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-black/70 p-1.5 text-white backdrop-blur">
            <CtrlButton onClick={reset} label="Recommencer">
              <RotateCcw className="h-4 w-4" />
            </CtrlButton>
            <CtrlButton onClick={() => setSpeed((s) => Math.max(0.5, s - 0.5))} label="Ralentir">
              <Minus className="h-4 w-4" />
            </CtrlButton>
            <Button onClick={toggle} className="h-10 w-10 rounded-xl p-0" aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <CtrlButton onClick={() => setSpeed((s) => Math.min(10, s + 0.5))} label="Accélérer">
              <Plus className="h-4 w-4" />
            </CtrlButton>
            <span className="w-10 text-center text-xs tabular-nums text-white/60">x{speed}</span>
            <CtrlButton onClick={() => setMirror((m) => !m)} label="Miroir" active={mirror}>
              <FlipHorizontal2 className="h-4 w-4" />
            </CtrlButton>
            {!fullscreen && (
              <CtrlButton onClick={() => setShowSettings((s) => !s)} label="Réglages" active={showSettings}>
                <Settings2 className="h-4 w-4" />
              </CtrlButton>
            )}
            <CtrlButton onClick={toggleFullscreen} label="Plein écran">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </CtrlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtrlButton({ onClick, label, children, active }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10", active && "bg-white/15")}>
      {children}
    </button>
  );
}

function Range({ label, value, min, max, step, onChange, display }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="text-subtle tabular-nums">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--brand)]" aria-label={label} />
    </div>
  );
}
