"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import { deletePublication, updatePublicationStats } from "@/app/actions/publications";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, EmptyState } from "@/components/ui/card";
import { platformColor, platformLabel } from "@/lib/platforms";
import type { Project, Publication } from "@/lib/types";
import { cn } from "@/lib/utils";

type Event = { id: string; date: Date; title: string; platform: string; kind: "planned" | "published" | "due"; href: string };

export function CalendarView({ projects, publications }: { projects: Project[]; publications: Publication[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month]);

  const events = useMemo(() => {
    const list: Event[] = [];
    for (const p of projects) {
      const title = p.chosen_title || p.title;
      if (p.published_at) list.push({ id: p.id + "-pub", date: new Date(p.published_at), title, platform: p.platform, kind: "published", href: `/projects/${p.id}` });
      else if (p.publish_at) list.push({ id: p.id + "-plan", date: new Date(p.publish_at), title, platform: p.platform, kind: "planned", href: `/projects/${p.id}` });
      if (p.due_date && !p.published_at) list.push({ id: p.id + "-due", date: new Date(p.due_date + "T12:00:00"), title: `Échéance : ${title}`, platform: p.platform, kind: "due", href: `/projects/${p.id}` });
    }
    return list;
  }, [projects]);

  const titleOf = (id: string | null) => {
    const p = projects.find((x) => x.id === id);
    return p ? p.chosen_title || p.title : "Publication";
  };

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-display text-lg font-semibold capitalize">{format(month, "MMMM yyyy", { locale: fr })}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
              Aujourd'hui
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, -1))} aria-label="Mois précédent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))} aria-label="Mois suivant">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-line text-center text-[11px] font-medium text-subtle uppercase">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.date, day));
            return (
              <div key={day.toISOString()} className={cn("min-h-20 border-r border-b border-line p-1 sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0", !isSameMonth(day, month) && "bg-surface-2/40")}>
                <span className={cn("mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs", isToday(day) ? "bg-brand font-semibold text-brand-fg" : isSameMonth(day, month) ? "text-muted" : "text-subtle")}>
                  {format(day, "d")}
                </span>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <Link
                      key={e.id}
                      href={e.href}
                      title={e.title}
                      className={cn(
                        "block truncate rounded-md border-l-2 px-1.5 py-0.5 text-[10px] leading-tight sm:text-[11px]",
                        e.kind === "published" ? "bg-success/10" : e.kind === "due" ? "bg-warning/10 text-muted" : "bg-brand-softer",
                      )}
                      style={{ borderLeftColor: platformColor(e.platform) }}
                    >
                      {e.kind === "published" && "✓ "}
                      {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && <p className="px-1 text-[10px] text-subtle">+{dayEvents.length - 3}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Suivi des publications</CardTitle>
        <p className="mt-1 text-xs text-muted">Renseigne tes chiffres pour suivre tes performances. La synchronisation automatique avec YouTube arrive bientôt.</p>
        {publications.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-xs text-subtle">
                  <th className="pb-2 font-medium">Contenu</th>
                  <th className="pb-2 font-medium">Plateforme</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Vues</th>
                  <th className="pb-2 font-medium">J'aime</th>
                  <th className="pb-2 font-medium">Commentaires</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {publications.map((p) => (
                  <PublicationRow key={p.id} pub={p} title={titleOf(p.project_id)} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="Aucune publication enregistrée">Dans un projet, onglet Suivi, clique sur « Marquer publié ».</EmptyState>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatInput({ value, onSave, label }: { value: number | null; onSave: (v: number | null) => void; label: string }) {
  const [v, setV] = useState(value?.toString() ?? "");
  return (
    <input
      value={v}
      inputMode="numeric"
      aria-label={label}
      onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))}
      onBlur={() => {
        const n = v === "" ? null : Number(v);
        if (n !== value) onSave(n);
      }}
      placeholder="—"
      className="w-20 rounded-md border border-transparent bg-transparent px-1.5 py-1 tabular-nums outline-none hover:border-line focus:border-brand-border"
    />
  );
}

function PublicationRow({ pub, title }: { pub: Publication; title: string }) {
  const [, start] = useTransition();
  return (
    <tr>
      <td className="max-w-56 truncate py-2 pr-3">
        {pub.project_id ? (
          <Link href={`/projects/${pub.project_id}`} className="hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </td>
      <td className="py-2 pr-3">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: platformColor(pub.platform) }} />
          {platformLabel(pub.platform)}
        </span>
      </td>
      <td className="py-2 pr-3 text-muted">{new Date(pub.published_at).toLocaleDateString("fr-FR")}</td>
      <td>
        <StatInput label="Vues" value={pub.views} onSave={(v) => start(() => updatePublicationStats(pub.id, { views: v }))} />
      </td>
      <td>
        <StatInput label="J'aime" value={pub.likes} onSave={(v) => start(() => updatePublicationStats(pub.id, { likes: v }))} />
      </td>
      <td>
        <StatInput label="Commentaires" value={pub.comments} onSave={(v) => start(() => updatePublicationStats(pub.id, { comments: v }))} />
      </td>
      <td className="py-2 text-right whitespace-nowrap">
        {pub.url && (
          <a href={pub.url} target="_blank" rel="noreferrer" className="mr-2 inline-flex text-subtle hover:text-fg" aria-label="Ouvrir">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button onClick={() => start(() => deletePublication(pub.id))} className="text-subtle hover:text-danger" aria-label="Supprimer">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
