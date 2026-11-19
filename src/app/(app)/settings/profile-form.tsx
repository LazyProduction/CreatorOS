"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { ThemeControls } from "@/components/theme-picker";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CONTENT_TYPES, PLATFORMS } from "@/lib/platforms";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [d, setD] = useState({
    display_name: profile.display_name ?? "",
    niche: profile.niche ?? "",
    content_types: profile.content_types,
    platforms: profile.platforms,
    target_audience: profile.target_audience ?? "",
    voice_notes: profile.voice_notes ?? "",
    language: profile.language as "fr" | "en",
    discord_webhook_url: profile.discord_webhook_url ?? "",
  });
  const [pending, start] = useTransition();
  const toggle = (key: "content_types" | "platforms", v: string) => setD((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((y) => y !== v) : [...x[key], v] }));

  function save() {
    start(async () => {
      const res = await updateProfile(d);
      if (res.ok) toast.success("Profil enregistré");
      else toast.error(res.error);
    });
  }

  const chip = (active: boolean) =>
    cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition", active ? "border-brand bg-brand-soft text-fg" : "border-line text-muted hover:text-fg");

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle>Apparence</CardTitle>
        <p className="mt-1 mb-4 text-xs text-muted">Clique sur une couleur : toute l'interface s'adapte instantanément.</p>
        <ThemeControls accent={profile.theme_accent} mode={profile.theme_mode} />
      </Card>

      <Card>
        <CardTitle>Profil créateur</CardTitle>
        <p className="mt-1 mb-5 text-xs text-muted">L'IA s'appuie sur ces informations pour chaque génération.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="s-name">Nom ou pseudo</Label>
            <Input id="s-name" value={d.display_name} onChange={(e) => setD({ ...d, display_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="s-lang">Langue des générations</Label>
            <Select id="s-lang" value={d.language} onChange={(e) => setD({ ...d, language: e.target.value as "fr" | "en" })}>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-niche">Niche</Label>
            <Input id="s-niche" value={d.niche} onChange={(e) => setD({ ...d, niche: e.target.value })} placeholder="ex : Speedruns de jeux rétro Nintendo" />
          </div>
          <div className="sm:col-span-2">
            <Label>Univers</Label>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => toggle("content_types", t)} className={chip(d.content_types.includes(t))}>
                  {d.content_types.includes(t) && <Check className="h-3 w-3" />} {t}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>Plateformes</Label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button key={p.key} type="button" onClick={() => toggle("platforms", p.key)} className={chip(d.platforms.includes(p.key))}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} /> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-aud">Audience</Label>
            <Input id="s-aud" value={d.target_audience} onChange={(e) => setD({ ...d, target_audience: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-voice">Style et voix</Label>
            <Textarea id="s-voice" value={d.voice_notes} onChange={(e) => setD({ ...d, voice_notes: e.target.value })} placeholder="Tutoiement, humour, expressions, longueur des phrases…" />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Intégrations</CardTitle>
        <p className="mt-1 mb-4 text-xs text-muted">
          Partage tes publications sur ton serveur Discord en un clic. Dans Discord : Paramètres du salon → Intégrations → Webhooks → Nouveau webhook → Copier l'URL.
        </p>
        <Label htmlFor="s-discord">URL du webhook Discord</Label>
        <Input id="s-discord" value={d.discord_webhook_url} onChange={(e) => setD({ ...d, discord_webhook_url: e.target.value })} placeholder="https://discord.com/api/webhooks/…" />
        <p className="mt-3 text-xs text-subtle">Connexion de YouTube, TikTok, Instagram, X et LinkedIn pour l'analyse automatique : bientôt disponible.</p>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-subtle">Connecté en tant que {email}</p>
        <Button onClick={save} loading={pending}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
