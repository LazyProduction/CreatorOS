"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, CheckSquare, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { moveProject, createProject } from "@/app/actions/projects";
import { createStage, deleteStage, updateStage } from "@/app/actions/stages";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatLabel, platformColor, platformLabel } from "@/lib/platforms";
import type { Project, Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAGE_COLORS = ["#a1a1aa", "#60a5fa", "#f59e0b", "#ec4899", "#22c55e", "#8b5cf6", "#06b6d4", "#ef4444"];

export function Board({ initialStages, initialProjects }: { initialStages: Stage[]; initialProjects: Project[] }) {
  const [stages, setStages] = useState(initialStages);
  const [projects, setProjects] = useState(initialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => setStages(initialStages), [initialStages]);
  useEffect(() => setProjects(initialProjects), [initialProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byStage = useMemo(() => {
    const map = new Map<string, Project[]>();
    stages.forEach((s) => map.set(s.id, []));
    const fallback = stages[0]?.id;
    for (const p of [...projects].sort((a, b) => a.position - b.position)) {
      const key = p.stage_id && map.has(p.stage_id) ? p.stage_id : fallback;
      if (key) map.get(key)!.push(p);
    }
    return map;
  }, [projects, stages]);

  const stageOf = (id: string) => {
    if (id.startsWith("stage:")) return id.slice(6);
    const p = projects.find((x) => x.id === id);
    return p?.stage_id && byStage.has(p.stage_id) ? p.stage_id : stages[0]?.id;
  };

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const from = stageOf(String(active.id));
    const to = stageOf(String(over.id));
    if (!from || !to || from === to) return;
    setProjects((ps) => ps.map((p) => (p.id === active.id ? { ...p, stage_id: to } : p)));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const to = stageOf(String(over.id));
    if (!to) return;

    const column = (byStage.get(to) ?? []).filter((p) => p.id !== id);
    let index = column.length;
    if (!String(over.id).startsWith("stage:") && over.id !== id) {
      const overIndex = column.findIndex((p) => p.id === over.id);
      if (overIndex >= 0) {
        const activeRect = active.rect.current.translated;
        const below = activeRect && over.rect ? activeRect.top > over.rect.top + over.rect.height / 2 : false;
        index = overIndex + (below ? 1 : 0);
      }
    } else if (over.id === id) {
      const current = byStage.get(to) ?? [];
      index = Math.max(0, current.findIndex((p) => p.id === id));
    }
    const prev = column[index - 1]?.position;
    const next = column[index]?.position;
    const position = prev === undefined && next === undefined ? 1024 : prev === undefined ? next! - 1024 : next === undefined ? prev + 1024 : (prev + next) / 2;

    const stage = stages.find((s) => s.id === to);
    setProjects((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, stage_id: to, position, published_at: stage?.is_published_stage ? p.published_at ?? new Date().toISOString() : p.published_at }
          : p,
      ),
    );
    start(async () => {
      try {
        await moveProject(id, to, position);
      } catch {
        toast.error("Impossible de déplacer le projet.");
      }
    });
  }

  const active = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-6 lg:-mx-8 lg:px-8">
        {stages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            projects={byStage.get(stage.id) ?? []}
            canDelete={stages.length > 1}
            onChange={(patch) => setStages((ss) => ss.map((s) => (s.id === stage.id ? { ...s, ...patch } : s)))}
            onDelete={() => setStages((ss) => ss.filter((s) => s.id !== stage.id))}
            onCreated={(p) => setProjects((ps) => [...ps, p])}
          />
        ))}
        <AddColumn onAdd={(s) => setStages((ss) => [...ss, s])} />
      </div>
      <DragOverlay>{active ? <Card project={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({
  stage,
  projects,
  canDelete,
  onChange,
  onDelete,
  onCreated,
}: {
  stage: Stage;
  projects: Project[];
  canDelete: boolean;
  onChange: (p: Partial<Stage>) => void;
  onDelete: () => void;
  onCreated: (p: Project) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stage.id}` });
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();

  function add() {
    const t = title.trim();
    if (!t) return setAdding(false);
    start(async () => {
      const id = await createProject({ title: t, stageId: stage.id });
      const now = new Date().toISOString();
      onCreated({
        id, user_id: "", stage_id: stage.id, position: Date.now(), title: t, brief: "", platform: "youtube", format: "long", tone: "dynamique",
        chosen_title: null, chosen_hook: null, script: "", description: "", tags: [], notes: "", checklist: [], due_date: null,
        publish_at: null, published_at: null, published_url: null, archived: false, created_at: now, updated_at: now,
      });
      setTitle("");
    });
  }

  return (
    <section className="flex w-[290px] shrink-0 flex-col" data-testid={`column-${stage.name}`}>
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
        <h2 className="truncate text-sm font-semibold">{stage.name}</h2>
        <span className="rounded-full bg-surface-2 px-2 text-xs text-muted tabular-nums">{projects.length}</span>
        <div className="flex-1" />
        <button onClick={() => setAdding(true)} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg" aria-label={`Ajouter un projet dans ${stage.name}`}>
          <Plus className="h-4 w-4" />
        </button>
        <button onClick={() => setEditing(true)} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg" aria-label={`Modifier l'étape ${stage.name}`}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-40 flex-1 flex-col gap-2.5 rounded-2xl border border-transparent bg-surface/60 p-2 transition",
          isOver && "border-brand-border bg-brand-softer",
        )}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((p) => (
            <SortableCard key={p.id} project={p} />
          ))}
        </SortableContext>
        {adding ? (
          <div className="rounded-xl border border-line bg-surface p-2">
            <Input
              autoFocus
              value={title}
              placeholder="Titre du projet"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
                if (e.key === "Escape") setAdding(false);
              }}
              onBlur={() => !title && setAdding(false)}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={add} loading={pending}>
                Ajouter
              </Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex h-9 items-center gap-2 rounded-xl px-2 text-sm text-subtle transition hover:bg-surface-2 hover:text-fg">
            <Plus className="h-4 w-4" /> Ajouter un projet
          </button>
        )}
      </div>
      <StageDialog open={editing} onClose={() => setEditing(false)} stage={stage} canDelete={canDelete} onChange={onChange} onDelete={onDelete} />
    </section>
  );
}

function SortableCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} {...attributes} {...listeners} className={cn(isDragging && "opacity-30")}>
      <Card project={project} />
    </div>
  );
}

function Card({ project, overlay }: { project: Project; overlay?: boolean }) {
  const done = project.checklist.filter((c) => c.done).length;
  const total = project.checklist.length;
  const date = project.publish_at ?? project.due_date;
  return (
    <Link
      href={`/projects/${project.id}`}
      draggable={false}
      className={cn(
        "block rounded-xl border border-line bg-surface p-3 transition hover:border-line-strong",
        overlay && "rotate-2 cursor-grabbing border-brand-border shadow-2xl",
      )}
      data-testid="project-card"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: platformColor(project.platform) }} />
        {platformLabel(project.platform)} · {formatLabel(project.format)}
      </div>
      <p className="line-clamp-2 text-sm leading-snug font-medium">{project.chosen_title || project.title}</p>
      {(date || total > 0) && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-subtle">
          {date && (
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {format(new Date(date), "d MMM", { locale: fr })}
            </span>
          )}
          {total > 0 && (
            <span className={cn("flex items-center gap-1", done === total && "text-success")}>
              <CheckSquare className="h-3 w-3" />
              {done}/{total}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function StageDialog({
  open,
  onClose,
  stage,
  canDelete,
  onChange,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  stage: Stage;
  canDelete: boolean;
  onChange: (p: Partial<Stage>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(stage.name);
  const [color, setColor] = useState(stage.color);
  const [published, setPublished] = useState(stage.is_published_stage);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      try {
        await updateStage(stage.id, { name, color, is_published_stage: published });
        onChange({ name, color, is_published_stage: published });
        onClose();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Modifier l'étape">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`stage-${stage.id}`}>Nom</Label>
          <Input id={`stage-${stage.id}`} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Couleur</Label>
          <div className="flex flex-wrap gap-2">
            {STAGE_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className="h-7 w-7 rounded-full transition hover:scale-110" style={{ background: c, boxShadow: color === c ? `0 0 0 2px var(--bg), 0 0 0 4px ${c}` : undefined }} aria-label={c} />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[var(--brand)]" />
          Les projets déplacés ici sont marqués comme publiés
        </label>
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="danger"
            size="sm"
            disabled={!canDelete}
            onClick={() =>
              start(async () => {
                try {
                  await deleteStage(stage.id);
                  onDelete();
                  onClose();
                } catch (e) {
                  toast.error((e as Error).message);
                }
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" /> Supprimer
          </Button>
          <Button onClick={save} loading={pending}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function AddColumn({ onAdd }: { onAdd: (s: Stage) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="flex h-11 w-[290px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm text-muted transition hover:border-brand-border hover:text-fg">
        <Plus className="h-4 w-4" /> Nouvelle étape
      </button>
    );
  return (
    <div className="w-[290px] shrink-0 rounded-2xl border border-line bg-surface p-3">
      <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : Sous-titres" maxLength={40} />
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
        <Button
          size="sm"
          loading={pending}
          onClick={() =>
            start(async () => {
              if (!name.trim()) return;
              const s = await createStage(name, STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)]);
              onAdd(s as Stage);
              setName("");
              setOpen(false);
            })
          }
        >
          Créer
        </Button>
      </div>
    </div>
  );
}
