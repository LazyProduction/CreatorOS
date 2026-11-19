"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { FolderOpen, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PLATFORMS, formatLabel, platformColor, platformLabel } from "@/lib/platforms";
import type { Project, Stage } from "@/lib/types";

export function ProjectList({ projects, stages }: { projects: Project[]; stages: Stage[] }) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [stage, setStage] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!query || `${p.title} ${p.chosen_title ?? ""} ${p.brief}`.toLowerCase().includes(query)) &&
        (!platform || p.platform === platform) &&
        (!stage || p.stage_id === stage),
    );
  }, [projects, q, platform, stage]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un projet…" className="pl-9" aria-label="Rechercher" />
        </div>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="sm:w-44" aria-label="Filtrer par plateforme">
          <option value="">Toutes les plateformes</option>
          {PLATFORMS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select value={stage} onChange={(e) => setStage(e.target.value)} className="sm:w-44" aria-label="Filtrer par étape">
          <option value="">Toutes les étapes</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      {filtered.length ? (
        <div className="card divide-y divide-line overflow-hidden p-0">
          {filtered.map((p) => {
            const s = stages.find((x) => x.id === p.stage_id);
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-4 px-4 py-3 transition hover:bg-surface-2 sm:px-5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: platformColor(p.platform) }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.chosen_title || p.title}</p>
                  <p className="text-xs text-subtle">
                    {platformLabel(p.platform)} · {formatLabel(p.format)} · modifié {formatDistanceToNow(new Date(p.updated_at), { locale: fr, addSuffix: true })}
                  </p>
                </div>
                {s && (
                  <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<FolderOpen className="h-5 w-5" />} title={projects.length ? "Aucun projet ne correspond" : "Aucun projet pour l'instant"}>
          {projects.length ? "Essaie d'autres filtres." : "Crée ton premier projet pour commencer."}
        </EmptyState>
      )}
    </>
  );
}
