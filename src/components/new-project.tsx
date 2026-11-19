"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { FORMATS, PLATFORMS, TONES } from "@/lib/platforms";
import type { Stage } from "@/lib/types";

export type NewProjectDefaults = { title?: string; brief?: string; format?: string };

export function NewProjectDialog({
  open,
  onClose,
  stages = [],
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  stages?: Stage[];
  defaults?: NewProjectDefaults;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    start(async () => {
      try {
        const id = await createProject({
          title: String(form.get("title") || "Nouveau projet"),
          brief: String(form.get("brief") || ""),
          platform: String(form.get("platform") || "youtube"),
          format: String(form.get("format") || "long") as "long",
          tone: String(form.get("tone") || "dynamique"),
          stageId: (form.get("stage") as string) || null,
          publishAt: form.get("publishAt") ? new Date(String(form.get("publishAt"))).toISOString() : null,
        });
        onClose();
        router.push(`/projects/${id}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nouveau projet" description="Une vidéo, un short, un post ou un live. Tu pourras tout générer avec l'IA ensuite.">
      <form action={submit} className="space-y-4">
        <div>
          <Label htmlFor="np-title">Titre de travail</Label>
          <Input id="np-title" name="title" required defaultValue={defaults?.title} placeholder="ex : J'ai fini Zelda sans bouclier" autoFocus />
        </div>
        <div>
          <Label htmlFor="np-brief">L'idée en quelques mots (facultatif)</Label>
          <Textarea id="np-brief" name="brief" defaultValue={defaults?.brief} placeholder="Ce que tu veux raconter, ce qui rend la vidéo unique..." className="min-h-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="np-platform">Plateforme</Label>
            <Select id="np-platform" name="platform" defaultValue="youtube">
              {PLATFORMS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="np-format">Format</Label>
            <Select id="np-format" name="format" defaultValue={defaults?.format ?? "long"}>
              {FORMATS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="np-tone">Ton</Label>
            <Select id="np-tone" name="tone" defaultValue="dynamique">
              {TONES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="np-date">Publication prévue</Label>
            <Input id="np-date" name="publishAt" type="datetime-local" />
          </div>
        </div>
        {stages.length > 0 && (
          <div>
            <Label htmlFor="np-stage">Étape</Label>
            <Select id="np-stage" name="stage" defaultValue={stages[0]?.id}>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={pending}>
            Créer le projet
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function NewProjectButton({ stages, label = "Nouveau projet", defaults }: { stages?: Stage[]; label?: string; defaults?: NewProjectDefaults }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </Button>
      <NewProjectDialog open={open} onClose={() => setOpen(false)} stages={stages} defaults={defaults} />
    </>
  );
}
