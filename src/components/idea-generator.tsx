"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { GenerateButton } from "@/components/generate-button";
import { NewProjectDialog, type NewProjectDefaults } from "@/components/new-project";
import { Badge } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { useGenerate } from "@/hooks/use-generate";
import { formatLabel } from "@/lib/platforms";
import type { Stage } from "@/lib/types";

export function IdeaGenerator({ stages, placeholder }: { stages: Stage[]; placeholder?: string }) {
  const [theme, setTheme] = useState("");
  const ideas = useGenerate("ideas");
  const [draft, setDraft] = useState<NewProjectDefaults | null>(null);

  return (
    <div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (theme.trim().length < 2) return;
          ideas.run({ theme });
        }}
      >
        <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder={placeholder ?? "Un thème, un jeu, un produit, une question de ta communauté…"} aria-label="Thématique" />
        <GenerateButton kind="ideas" type="submit" loading={ideas.pending} disabled={theme.trim().length < 2}>
          Trouver des idées
        </GenerateButton>
      </form>
      {ideas.output && (
        <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
          {ideas.output.ideas.map((idea, i) => (
            <li key={i} className="group flex flex-col rounded-xl border border-line bg-surface-2/50 p-3.5 transition hover:border-line-strong">
              <div className="mb-1.5 flex items-center justify-between">
                <Badge>{formatLabel(idea.format)}</Badge>
                <CopyButton text={`${idea.title}\n${idea.angle}\nHook : ${idea.hook}`} className="opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-sm font-medium">{idea.title}</p>
              <p className="mt-1 text-xs text-muted">{idea.angle}</p>
              <p className="mt-2 text-xs text-subtle italic">« {idea.hook} »</p>
              <button
                onClick={() => setDraft({ title: idea.title, brief: `${idea.angle}\n\nHook : ${idea.hook}`, format: idea.format })}
                className="mt-3 inline-flex items-center gap-1 self-start text-xs font-medium text-brand-text hover:underline"
              >
                Créer un projet <ArrowRight className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!ideas.output && !ideas.pending && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
          <Lightbulb className="h-3.5 w-3.5" /> 8 idées avec un angle unique, adaptées à ta niche et à tes plateformes.
        </p>
      )}
      {draft && <NewProjectDialog open onClose={() => setDraft(null)} stages={stages} defaults={draft} />}
    </div>
  );
}
