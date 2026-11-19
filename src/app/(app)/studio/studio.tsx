"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Lightbulb, Palette } from "lucide-react";
import { GenerateButton } from "@/components/generate-button";
import { IdeaGenerator } from "@/components/idea-generator";
import { Card, CardTitle, EmptyState } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Textarea } from "@/components/ui/input";
import { useGenerate } from "@/hooks/use-generate";
import { KINDS, isKind, type KindOutput } from "@/lib/ai/kinds";
import type { Generation, Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "ideas", label: "Idées", icon: Lightbulb },
  { key: "branding", label: "Branding de chaîne", icon: Palette },
  { key: "history", label: "Historique", icon: History },
] as const;

export function StudioTabs({ stages, lastBranding, history }: { stages: Stage[]; lastBranding: KindOutput<"branding"> | null; history: Generation[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("ideas");
  return (
    <>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm transition",
              tab === t.key ? "border-brand-border bg-brand-soft text-fg" : "border-line text-muted hover:text-fg",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-up" key={tab}>
        {tab === "ideas" && (
          <Card>
            <CardTitle>Générateur d'idées</CardTitle>
            <p className="mt-1 mb-4 text-xs text-muted">Transforme n'importe quelle idée en projet en un clic.</p>
            <IdeaGenerator stages={stages} />
          </Card>
        )}
        {tab === "branding" && <Branding initial={lastBranding} />}
        {tab === "history" && <HistoryList history={history} />}
      </div>
    </>
  );
}

function Section({ title, children, copy }: { title: string; children: React.ReactNode; copy?: string }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {copy && <CopyButton text={copy} />}
      </div>
      {children}
    </Card>
  );
}

function Branding({ initial }: { initial: KindOutput<"branding"> | null }) {
  const [extra, setExtra] = useState("");
  const b = useGenerate("branding", initial);
  const o = b.output;
  return (
    <div className="space-y-5">
      <Card>
        <CardTitle>Ton identité de marque, de A à Z</CardTitle>
        <p className="mt-1 text-xs text-muted">Noms, slogan, bios, piliers de contenu, palette, polices, et prompts prêts à l'emploi pour ton logo et ton avatar. Basé sur ton profil créateur.</p>
        <Label htmlFor="brand-extra" className="mt-4">
          Précisions (facultatif)
        </Label>
        <Textarea id="brand-extra" value={extra} onChange={(e) => setExtra(e.target.value)} className="min-h-20" placeholder="ex : j'ai déjà le nom « LazyProd », je veux un univers rétro années 90" />
        <GenerateButton kind="branding" className="mt-3" loading={b.pending} again={!!o} onClick={() => b.run({ extra })}>
          {o ? "Régénérer le branding" : "Générer mon branding"}
        </GenerateButton>
      </Card>
      {o ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Section title="Idées de noms">
            <ul className="space-y-2">
              {o.channel_names.map((n) => (
                <li key={n.name} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold">{n.name}</p>
                    <p className="text-xs text-muted">{n.why}</p>
                  </div>
                  <CopyButton text={n.name} />
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Palette de couleurs" copy={o.palette.map((c) => `${c.name} ${c.hex}`).join("\n")}>
            <div className="grid grid-cols-5 gap-2">
              {o.palette.map((c) => (
                <button key={c.hex + c.name} onClick={() => navigator.clipboard.writeText(c.hex)} className="text-left" title="Copier le code couleur">
                  <span className="block aspect-square rounded-xl border border-line" style={{ background: c.hex }} />
                  <span className="mt-1 block truncate text-[11px] font-medium">{c.name}</span>
                  <span className="block text-[10px] text-subtle uppercase">{c.hex}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              Polices : <span className="font-medium text-fg">{o.fonts.title}</span> (titres) · <span className="font-medium text-fg">{o.fonts.body}</span> (texte)
            </p>
          </Section>
          <Section title="Slogan et bannière" copy={`${o.slogan}\n${o.banner_text}`}>
            <p className="font-display text-xl font-semibold text-brand-text">{o.slogan}</p>
            <p className="mt-2 text-sm text-muted">Bannière : {o.banner_text}</p>
          </Section>
          <Section title="Ton de voix" copy={o.tone_of_voice}>
            <p className="text-sm leading-relaxed">{o.tone_of_voice}</p>
          </Section>
          <Section title="Bio courte (TikTok, Instagram, X)" copy={o.bio_short}>
            <p className="text-sm leading-relaxed">{o.bio_short}</p>
            <p className="mt-1 text-right text-[11px] text-subtle">{o.bio_short.length} caractères</p>
          </Section>
          <Section title="Description de chaîne YouTube" copy={o.bio_long}>
            <p className="text-sm leading-relaxed whitespace-pre-line">{o.bio_long}</p>
          </Section>
          <Section title="Piliers de contenu">
            <ul className="space-y-2">
              {o.content_pillars.map((p) => (
                <li key={p.name}>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.description}</p>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Prompts logo et avatar" copy={`Logo : ${o.logo_prompt}\n\nAvatar : ${o.avatar_prompt}`}>
            <p className="text-xs font-medium text-muted">Logo</p>
            <p className="mb-3 font-mono text-xs leading-relaxed">{o.logo_prompt}</p>
            <p className="text-xs font-medium text-muted">Avatar</p>
            <p className="font-mono text-xs leading-relaxed">{o.avatar_prompt}</p>
            <p className="mt-3 text-[11px] text-subtle">La génération d'images directement dans CreatorOS arrive bientôt.</p>
          </Section>
        </div>
      ) : (
        <EmptyState icon={<Palette className="h-5 w-5" />} title="Pas encore de branding">
          Complète ton profil créateur dans les paramètres pour un résultat plus juste.
        </EmptyState>
      )}
    </div>
  );
}

function HistoryList({ history }: { history: Generation[] }) {
  if (!history.length) return <EmptyState icon={<History className="h-5 w-5" />} title="Aucune génération pour l'instant" />;
  return (
    <Card className="p-0">
      <ul className="divide-y divide-line">
        {history.map((g) => (
          <li key={g.id} className="flex items-center gap-3 px-5 py-3 text-sm">
            <span className="font-medium">{isKind(g.kind) ? KINDS[g.kind].label : g.kind}</span>
            <span className="text-xs text-subtle">{new Date(g.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
            <div className="flex-1" />
            <span className="text-xs text-muted">{g.credits_used} crédit{g.credits_used > 1 ? "s" : ""}</span>
            {g.project_id && (
              <Link href={`/projects/${g.project_id}`} className="text-xs text-brand-text hover:underline">
                Projet
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
