"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  CloudCheck,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MonitorPlay,
  Plus,
  Send,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteProject, updateProject } from "@/app/actions/projects";
import { addPublication, deletePublication, shareToDiscord } from "@/app/actions/publications";
import { GenerateButton } from "@/components/generate-button";
import { Button, buttonClass } from "@/components/ui/button";
import { Badge, Card, CardTitle, EmptyState } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAutosave, type SaveState } from "@/hooks/use-autosave";
import { useGenerate } from "@/hooks/use-generate";
import type { KindOutput } from "@/lib/ai/kinds";
import { FORMATS, PLATFORMS, TONES, platformColor, platformLabel } from "@/lib/platforms";
import type { ChecklistItem, Project, Publication, Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

type Patch = Parameters<typeof updateProject>[1];

const TABS = [
  { key: "idea", label: "Idée & titres" },
  { key: "script", label: "Script" },
  { key: "publish", label: "Publication" },
  { key: "track", label: "Suivi" },
] as const;
type Tab = (typeof TABS)[number]["key"];

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="flex items-center gap-1 text-xs text-subtle" aria-live="polite">
      {state === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…
        </>
      )}
      {state === "saved" && (
        <>
          <CloudCheck className="h-3.5 w-3.5 text-success" /> Enregistré
        </>
      )}
      {state === "error" && <span className="text-danger">Erreur d'enregistrement</span>}
    </span>
  );
}

export function ProjectEditor({
  project: initial,
  stages,
  latest,
  publications,
  platforms,
  hasDiscord,
}: {
  project: Project;
  stages: Stage[];
  latest: Record<string, unknown>;
  publications: Publication[];
  platforms: string[];
  hasDiscord: boolean;
}) {
  const [p, setP] = useState(initial);
  const [tab, setTab] = useState<Tab>("idea");
  const { state, queue, flush } = useAutosave<Patch>((patch) => updateProject(p.id, patch));

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    queue({ [key]: value } as Patch);
  }

  /** Recharge le projet après une génération (le kit peut avoir rempli des champs). */
  function apply(patch: Partial<Project>) {
    setP((prev) => ({ ...prev, ...patch }));
    queue(patch as Patch);
  }

  const stage = stages.find((s) => s.id === p.stage_id);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/pipeline" className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> Pipeline
        </Link>
        <SaveIndicator state={state} />
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <input
            value={p.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={() => !p.title.trim() && set("title", "Nouveau projet")}
            className="w-full bg-transparent font-display text-2xl font-semibold tracking-tight outline-none placeholder:text-subtle sm:text-3xl"
            aria-label="Titre du projet"
            maxLength={200}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={p.stage_id ?? ""} onChange={(e) => set("stage_id", e.target.value)} className="h-8 w-auto text-xs" aria-label="Étape">
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select value={p.platform} onChange={(e) => set("platform", e.target.value)} className="h-8 w-auto text-xs" aria-label="Plateforme">
              {PLATFORMS.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </Select>
            <Select value={p.format} onChange={(e) => set("format", e.target.value as Project["format"])} className="h-8 w-auto text-xs" aria-label="Format">
              {FORMATS.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </Select>
            <Select value={p.tone} onChange={(e) => set("tone", e.target.value)} className="h-8 w-auto text-xs" aria-label="Ton">
              {TONES.map((x) => (
                <option key={x.key} value={x.key}>
                  Ton : {x.label}
                </option>
              ))}
            </Select>
            {stage && <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={`/teleprompter?project=${p.id}`} onClick={() => void flush()} className={buttonClass("secondary")}>
            <MonitorPlay className="h-4 w-4" /> Téléprompteur
          </Link>
          <KitButton project={p} onApply={apply} />
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative h-10 shrink-0 px-4 text-sm transition",
              tab === t.key ? "font-medium text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      <div className="animate-fade-up" key={tab}>
        {tab === "idea" && <IdeaTab p={p} set={set} latest={latest} />}
        {tab === "script" && <ScriptTab p={p} set={set} latest={latest} />}
        {tab === "publish" && <PublishTab p={p} set={set} latest={latest} hasDiscord={hasDiscord} />}
        {tab === "track" && <TrackTab p={p} set={set} publications={publications} platforms={platforms} hasDiscord={hasDiscord} />}
      </div>
    </div>
  );
}

type TabProps = {
  p: Project;
  set: <K extends keyof Project>(key: K, value: Project[K]) => void;
  latest: Record<string, unknown>;
};

function KitButton({ project, onApply }: { project: Project; onApply: (patch: Partial<Project>) => void }) {
  const { pending, run } = useGenerate("kit");
  return (
    <GenerateButton
      kind="kit"
      loading={pending}
      onClick={() =>
        run({ projectId: project.id }, (o) => {
          onApply({
            chosen_title: project.chosen_title || o.titles[0]?.title || null,
            chosen_hook: project.chosen_hook || o.hooks[0]?.hook || null,
            description: project.description || o.description,
            tags: project.tags.length ? project.tags : o.tags,
          });
          toast.success("Kit généré : titres, hooks, description, tags et posts sont prêts.");
        })
      }
    >
      Kit complet
    </GenerateButton>
  );
}

function ChoiceList({
  items,
  chosen,
  onChoose,
  renderMeta,
}: {
  items: { text: string; meta?: string }[];
  chosen: string | null;
  onChoose: (t: string) => void;
  renderMeta?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const active = chosen === it.text;
        return (
          <li
            key={i}
            className={cn(
              "group flex items-start gap-3 rounded-xl border p-3 transition",
              active ? "border-brand bg-brand-softer" : "border-line bg-surface-2/50 hover:border-line-strong",
            )}
          >
            <button onClick={() => onChoose(it.text)} className="mt-0.5 shrink-0 text-muted hover:text-brand-text" aria-label="Choisir">
              {active ? <CheckCircle2 className="h-4.5 w-4.5 text-brand-text" /> : <Circle className="h-4.5 w-4.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed">{it.text}</p>
              {renderMeta && it.meta && <p className="mt-1 text-xs text-subtle">{it.meta}</p>}
            </div>
            <CopyButton text={it.text} className="opacity-60 group-hover:opacity-100" />
          </li>
        );
      })}
    </ul>
  );
}

function IdeaTab({ p, set, latest }: TabProps) {
  const kit = latest.kit as KindOutput<"kit"> | undefined;
  const titles = useGenerate("titles", (latest.titles as KindOutput<"titles">) ?? (kit ? { titles: kit.titles } : null));
  const hooks = useGenerate("hooks", (latest.hooks as KindOutput<"hooks">) ?? (kit ? { hooks: kit.hooks } : null));

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardTitle>L'idée</CardTitle>
        <p className="mt-1 text-xs text-muted">Plus ton brief est précis, plus l'IA est pertinente : le moment fort, ton angle, ce que tu veux montrer.</p>
        <Textarea
          value={p.brief}
          onChange={(e) => set("brief", e.target.value)}
          className="mt-4 min-h-48"
          placeholder="ex : Je refais le premier donjon avec uniquement les objets trouvés dans les 10 premières minutes, et je montre le glitch que presque personne ne connaît…"
          aria-label="Brief"
        />
        <div className="mt-5 space-y-3">
          <div>
            <Label htmlFor="chosen-title">Titre retenu</Label>
            <Input id="chosen-title" value={p.chosen_title ?? ""} onChange={(e) => set("chosen_title", e.target.value || null)} placeholder="Choisis-en un à droite ou écris le tien" />
            <p className={cn("mt-1 text-right text-[11px]", (p.chosen_title?.length ?? 0) > 70 ? "text-warning" : "text-subtle")}>{p.chosen_title?.length ?? 0} / 70</p>
          </div>
          <div>
            <Label htmlFor="chosen-hook">Hook retenu</Label>
            <Textarea id="chosen-hook" value={p.chosen_hook ?? ""} onChange={(e) => set("chosen_hook", e.target.value || null)} className="min-h-20" placeholder="Les premières secondes de ta vidéo" />
          </div>
        </div>
      </Card>

      <div className="space-y-5 lg:col-span-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Titres</CardTitle>
              <p className="text-xs text-muted">6 propositions aux mécaniques différentes.</p>
            </div>
            <GenerateButton kind="titles" size="sm" again={!!titles.output} loading={titles.pending} onClick={() => titles.run({ projectId: p.id })} />
          </div>
          <div className="mt-4">
            {titles.output ? (
              <ChoiceList renderMeta items={titles.output.titles.map((t) => ({ text: t.title, meta: t.why }))} chosen={p.chosen_title} onChoose={(t) => set("chosen_title", t)} />
            ) : (
              <EmptyState title="Aucun titre pour l'instant">Lance une génération : tu pourras choisir ton préféré en un clic.</EmptyState>
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Hooks</CardTitle>
              <p className="text-xs text-muted">Les 3 à 8 premières secondes qui retiennent l'audience.</p>
            </div>
            <GenerateButton kind="hooks" size="sm" again={!!hooks.output} loading={hooks.pending} onClick={() => hooks.run({ projectId: p.id })} />
          </div>
          <div className="mt-4">
            {hooks.output ? (
              <ChoiceList renderMeta items={hooks.output.hooks.map((h) => ({ text: h.hook, meta: h.style }))} chosen={p.chosen_hook} onChoose={(t) => set("chosen_hook", t)} />
            ) : (
              <EmptyState title="Aucun hook pour l'instant">Choisis un titre d'abord pour des hooks plus cohérents.</EmptyState>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScriptTab({ p, set }: TabProps) {
  const [extra, setExtra] = useState("");
  const script = useGenerate("script");
  const words = p.script.trim() ? p.script.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 150));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>Script</CardTitle>
          <span className="text-xs text-subtle">
            {words} mots · environ {minutes} min à l'oral
          </span>
        </div>
        <Textarea
          value={p.script}
          onChange={(e) => set("script", e.target.value)}
          className="min-h-[60vh] font-mono text-[13px]"
          placeholder={"## HOOK\nÉcris ton script ici, ou génère-le avec l'IA…"}
          aria-label="Script"
        />
      </Card>
      <div className="space-y-5">
        <Card>
          <CardTitle>Générer le script</CardTitle>
          <p className="mt-1 text-xs text-muted">L'IA utilise ton brief, ton titre, ton hook et ton profil créateur. Le script actuel sera remplacé.</p>
          <Label htmlFor="script-extra" className="mt-4">
            Consignes (facultatif)
          </Label>
          <Textarea id="script-extra" value={extra} onChange={(e) => setExtra(e.target.value)} className="min-h-24" placeholder="ex : insiste sur la partie 2, ajoute une blague récurrente, termine sur une question" />
          <GenerateButton
            kind="script"
            className="mt-3 w-full"
            loading={script.pending}
            onClick={() => {
              if (p.script.trim() && !confirm("Remplacer le script actuel ?")) return;
              script.run({ projectId: p.id, extra }, (o) => {
                set("script", o.script);
                toast.success(`Script généré (${o.duration_estimate}).`);
              });
            }}
          >
            Écrire le script
          </GenerateButton>
        </Card>
        <Card>
          <CardTitle>Tourner</CardTitle>
          <p className="mt-1 text-xs text-muted">Lis ton script au téléprompteur : défilement réglable, miroir, plein écran.</p>
          <Link href={`/teleprompter?project=${p.id}`} className={buttonClass("secondary", "md", "mt-3 w-full")}>
            <MonitorPlay className="h-4 w-4" /> Ouvrir le téléprompteur
          </Link>
        </Card>
      </div>
    </div>
  );
}

function PublishTab({ p, set, latest, hasDiscord }: TabProps & { hasDiscord: boolean }) {
  const kit = latest.kit as KindOutput<"kit"> | undefined;
  const desc = useGenerate("description", (latest.description as KindOutput<"description">) ?? null);
  const tags = useGenerate("tags", (latest.tags as KindOutput<"tags">) ?? (kit ? { tags: kit.tags, hashtags: kit.hashtags } : null));
  const promo = useGenerate("promo", (latest.promo as KindOutput<"promo">) ?? (kit ? { posts: kit.posts } : null));
  const [tagInput, setTagInput] = useState("");

  const addTag = (t: string) => {
    const clean = t.replace(/^#/, "").trim();
    if (clean && !p.tags.includes(clean)) set("tags", [...p.tags, clean]);
  };
  const tagChars = p.tags.join(",").length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Description</CardTitle>
          <div className="flex items-center gap-1">
            <CopyButton text={p.description} label="Copier" />
            <GenerateButton
              kind="description"
              size="sm"
              loading={desc.pending}
              onClick={() =>
                desc.run({ projectId: p.id }, (o) => {
                  const chapters = o.chapters.length ? `\n\n${o.chapters.map((c) => `${c.time} ${c.label}`).join("\n")}` : "";
                  set("description", o.description + chapters);
                })
              }
            />
          </div>
        </div>
        <Textarea value={p.description} onChange={(e) => set("description", e.target.value)} className="mt-4 min-h-72" placeholder="Description de ta publication…" aria-label="Description" />
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Tags</CardTitle>
            <p className={cn("text-xs", tagChars > 500 ? "text-warning" : "text-muted")}>{tagChars} / 500 caractères (limite YouTube)</p>
          </div>
          <div className="flex items-center gap-1">
            <CopyButton text={p.tags.join(", ")} label="Copier" />
            <GenerateButton kind="tags" size="sm" loading={tags.pending} onClick={() => tags.run({ projectId: p.id }, (o) => set("tags", o.tags))} />
          </div>
        </div>
        <div className="mt-4 flex min-h-24 flex-wrap content-start gap-1.5 rounded-xl border border-line bg-surface-2 p-2">
          {p.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-md bg-surface-3 px-2 py-1 text-xs">
              {t}
              <button onClick={() => set("tags", p.tags.filter((x) => x !== t))} aria-label={`Retirer ${t}`} className="text-subtle hover:text-fg">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
                setTagInput("");
              }
            }}
            placeholder="Ajouter un tag…"
            className="min-w-24 flex-1 bg-transparent px-1 text-xs outline-none"
          />
        </div>
        {tags.output?.hashtags?.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-subtle">Hashtags :</span>
            {tags.output.hashtags.map((h) => (
              <Badge key={h}>{h}</Badge>
            ))}
            <CopyButton text={tags.output.hashtags.join(" ")} />
          </div>
        ) : null}
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Posts de promotion</CardTitle>
            <p className="text-xs text-muted">Un post adapté à chacune de tes plateformes.</p>
          </div>
          <GenerateButton kind="promo" size="sm" loading={promo.pending} onClick={() => promo.run({ projectId: p.id })} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {promo.output?.posts.length ? (
            promo.output.posts.map((post, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface-2/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ background: platformColor(post.platform.toLowerCase()) }} />
                    {platformLabel(post.platform.toLowerCase())}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasDiscord && <DiscordShare message={post.text} url={p.published_url ?? undefined} />}
                    <CopyButton text={post.text} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{post.text}</p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState title="Aucun post pour l'instant">Génère des posts LinkedIn, X, Instagram, Discord… adaptés à chaque réseau.</EmptyState>
            </div>
          )}
        </div>
      </Card>

      {kit?.thumbnail_ideas?.length ? (
        <Card className="lg:col-span-2">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-brand-text" /> Idées de miniatures
          </CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {kit.thumbnail_ideas.map((t, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface-2/50 p-3">
                <p className="font-display text-lg font-bold tracking-tight text-brand-text">{t.text}</p>
                <p className="mt-1 text-xs text-muted">{t.visual}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function DiscordShare({ message, url }: { message: string; url?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await shareToDiscord({ message, url });
          if (res.ok) toast.success("Partagé sur Discord");
          else toast.error(res.error);
        })
      }
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-surface-3 hover:text-fg"
      title="Partager sur Discord"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
    </button>
  );
}

function TrackTab({
  p,
  set,
  publications,
  platforms,
  hasDiscord,
}: Omit<TabProps, "latest"> & { publications: Publication[]; platforms: string[]; hasDiscord: boolean }) {
  const [newItem, setNewItem] = useState("");
  const [pending, start] = useTransition();
  const [pubPlatform, setPubPlatform] = useState(p.platform);
  const [pubUrl, setPubUrl] = useState("");

  const toggle = (id: string) => set("checklist", p.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  const add = () => {
    if (!newItem.trim()) return;
    set("checklist", [...p.checklist, { id: crypto.randomUUID(), label: newItem.trim(), done: false } as ChecklistItem]);
    setNewItem("");
  };
  const done = p.checklist.filter((c) => c.done).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Checklist de production</CardTitle>
          <span className="text-xs text-muted">
            {done}/{p.checklist.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.checklist.length ? (done / p.checklist.length) * 100 : 0}%` }} />
        </div>
        <ul className="mt-4 space-y-1">
          {p.checklist.map((c) => (
            <li key={c.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
              <button onClick={() => toggle(c.id)} className={cn("flex h-4.5 w-4.5 items-center justify-center rounded-md border transition", c.done ? "border-brand bg-brand text-brand-fg" : "border-line-strong")} aria-label={c.label}>
                {c.done && <Check className="h-3 w-3" />}
              </button>
              <span className={cn("flex-1 text-sm", c.done && "text-subtle line-through")}>{c.label}</span>
              <button onClick={() => set("checklist", p.checklist.filter((x) => x.id !== c.id))} className="text-subtle opacity-0 group-hover:opacity-100 hover:text-danger" aria-label="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Nouvelle tâche…" className="h-9" />
          <Button size="sm" variant="secondary" onClick={add} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Planning</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="due">Échéance de production</Label>
            <Input id="due" type="date" value={p.due_date ?? ""} onChange={(e) => set("due_date", e.target.value || null)} />
          </div>
          <div>
            <Label htmlFor="publish">Publication prévue</Label>
            <Input id="publish" type="datetime-local" value={toLocalInput(p.publish_at)} onChange={(e) => set("publish_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
          </div>
        </div>
        <Label htmlFor="notes" className="mt-4">
          Notes
        </Label>
        <Textarea id="notes" value={p.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Idées de plans, matériel, invités, liens…" />
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle>Publications</CardTitle>
        <p className="mt-1 text-xs text-muted">Note où ce contenu est publié. Bientôt : statistiques et analyse IA automatiques via la connexion de tes comptes.</p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          action={() =>
            start(async () => {
              await addPublication({ projectId: p.id, platform: pubPlatform, url: pubUrl });
              if (pubUrl && !p.published_url) set("published_url", pubUrl);
              setPubUrl("");
              toast.success("Publication ajoutée");
            })
          }
        >
          <Select value={pubPlatform} onChange={(e) => setPubPlatform(e.target.value)} className="sm:w-44" aria-label="Plateforme de publication">
            {PLATFORMS.filter((x) => platforms.includes(x.key) || x.key === p.platform).map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </Select>
          <Input value={pubUrl} onChange={(e) => setPubUrl(e.target.value)} placeholder="Lien de la publication (facultatif)" type="url" />
          <Button type="submit" loading={pending}>
            Marquer publié
          </Button>
        </form>
        <ul className="mt-4 divide-y divide-line">
          {publications.map((pub) => (
            <li key={pub.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: platformColor(pub.platform) }} />
              <span className="font-medium">{platformLabel(pub.platform)}</span>
              <span className="text-xs text-subtle">{new Date(pub.published_at).toLocaleDateString("fr-FR")}</span>
              <div className="flex-1" />
              {pub.url && (
                <a href={pub.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-text hover:underline">
                  Voir <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {hasDiscord && pub.url && <DiscordShare message={`Nouveau contenu : ${p.chosen_title || p.title}`} url={pub.url} />}
              <button onClick={() => start(() => deletePublication(pub.id))} className="text-subtle hover:text-danger" aria-label="Supprimer la publication">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        {!hasDiscord && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
            <Wand2 className="h-3.5 w-3.5" /> Ajoute ton webhook Discord dans{" "}
            <Link href="/settings" className="text-brand-text hover:underline">
              les paramètres
            </Link>{" "}
            pour partager tes publications en un clic.
          </p>
        )}
      </Card>

      <div className="lg:col-span-2">
        <form action={() => deleteProject(p.id)} onSubmit={(e) => !confirm("Supprimer définitivement ce projet ?") && e.preventDefault()}>
          <Button type="submit" variant="danger" size="sm">
            <Trash2 className="h-3.5 w-3.5" /> Supprimer le projet
          </Button>
        </form>
      </div>
    </div>
  );
}
