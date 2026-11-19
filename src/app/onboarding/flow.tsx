"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ThemeControls } from "@/components/theme-picker";
import { updateProfile } from "@/app/actions/profile";
import { CONTENT_TYPES, PLATFORMS } from "@/lib/platforms";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition",
        active ? "border-brand bg-brand-soft text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {active && <Check className="h-3.5 w-3.5 text-brand-text" />}
      {children}
    </button>
  );
}

export function OnboardingFlow({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [data, setData] = useState({
    display_name: profile.display_name ?? "",
    content_types: profile.content_types,
    platforms: profile.platforms.length ? profile.platforms : ["youtube"],
    niche: profile.niche ?? "",
    target_audience: profile.target_audience ?? "",
    voice_notes: profile.voice_notes ?? "",
  });

  const toggle = (key: "content_types" | "platforms", v: string) =>
    setData((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));

  const steps = [
    {
      title: "Quel type de contenu crées-tu ?",
      hint: "L'IA adapte son vocabulaire et ses références à ton univers.",
      valid: data.content_types.length > 0,
      body: (
        <div className="space-y-5">
          <div>
            <Label htmlFor="name">Ton nom ou pseudo de créateur</Label>
            <Input id="name" value={data.display_name} onChange={(e) => setData({ ...data, display_name: e.target.value })} placeholder="ex : Lazy" />
          </div>
          <div>
            <Label>Tes univers (plusieurs choix possibles)</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <Chip key={t} active={data.content_types.includes(t)} onClick={() => toggle("content_types", t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Où publies-tu ?",
      hint: "On génère des contenus adaptés aux codes de chaque plateforme.",
      valid: data.platforms.length > 0,
      body: (
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <Chip key={p.key} active={data.platforms.includes(p.key)} onClick={() => toggle("platforms", p.key)}>
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.label}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Parle-nous de ta chaîne",
      hint: "Plus c'est précis, meilleures sont les générations. Tu pourras modifier ça plus tard.",
      valid: true,
      body: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="niche">Ta niche, en une phrase</Label>
            <Input id="niche" value={data.niche} onChange={(e) => setData({ ...data, niche: e.target.value })} placeholder="ex : Speedruns et secrets de jeux rétro Nintendo" />
          </div>
          <div>
            <Label htmlFor="aud">Ton audience</Label>
            <Input id="aud" value={data.target_audience} onChange={(e) => setData({ ...data, target_audience: e.target.value })} placeholder="ex : 18-30 ans, joueurs nostalgiques" />
          </div>
          <div>
            <Label htmlFor="voice">Ton style (facultatif)</Label>
            <Textarea id="voice" value={data.voice_notes} onChange={(e) => setData({ ...data, voice_notes: e.target.value })} placeholder="ex : Tutoiement, humour pince-sans-rire, expressions du sud, phrases courtes" />
          </div>
        </div>
      ),
    },
    {
      title: "Choisis tes couleurs",
      hint: "Clique sur une couleur : toute l'interface change. Modifiable à tout moment.",
      valid: true,
      body: <ThemeControls accent={profile.theme_accent} mode={profile.theme_mode} />,
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  function next() {
    if (!last) return setStep(step + 1);
    start(async () => {
      const res = await updateProfile({ ...data, onboarded: true });
      if (!res.ok) return void toast.error(res.error);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="ambient flex min-h-dvh flex-col items-center px-4 py-10">
      <Logo className="mb-10" />
      <div className="w-full max-w-xl">
        <div className="mb-6 flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full transition", i <= step ? "bg-brand" : "bg-surface-3")} />
          ))}
        </div>
        <div className="card animate-fade-up p-6 sm:p-8" key={step}>
          <p className="text-xs font-medium text-brand-text">
            Étape {step + 1} sur {steps.length}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{current.title}</h1>
          <p className="mt-1 text-sm text-muted">{current.hint}</p>
          <div className="mt-6">{current.body}</div>
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={next} disabled={!current.valid} loading={pending}>
              {last ? "Accéder à mon espace" : "Continuer"} {!last && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
