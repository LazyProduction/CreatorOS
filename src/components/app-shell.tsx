"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Settings,
  Sparkles,
  X,
  Zap,
  FolderOpen,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemePopover } from "@/components/theme-picker";
import { signOut } from "@/app/actions/auth";
import { planOf } from "@/lib/plans";
import type { Profile } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/studio", label: "Studio IA", icon: Sparkles },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/projects", label: "Projets", icon: FolderOpen },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/teleprompter", label: "Téléprompteur", icon: MonitorPlay },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition",
              active ? "bg-brand-soft font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            {active && <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />}
            <Icon className={cn("h-4 w-4", active && "text-brand-text")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function CreditsCard({ profile, credits }: { profile: Profile; credits: number }) {
  const plan = planOf(profile.plan);
  const max = Math.max(plan.monthlyCredits, credits);
  const pct = Math.min(100, (credits / Math.max(1, max)) * 100);
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Zap className="h-3.5 w-3.5 text-brand-text" /> Crédits IA
        </span>
        <span className="font-semibold tabular-nums" data-testid="credits">
          {credits}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-subtle">
        Plan {plan.name} · {plan.monthlyCredits} / mois
      </p>
      {profile.plan === "free" && (
        <Link href="/settings/billing" className="mt-2.5 flex h-8 items-center justify-center gap-1 rounded-lg bg-brand text-xs font-semibold text-brand-fg transition hover:brightness-110">
          Passer à Créateur
        </Link>
      )}
    </div>
  );
}

export function AppShell({ profile, credits, email, children }: { profile: Profile; credits: number; email: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const name = profile.display_name || email.split("@")[0];

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo href="/dashboard" className="px-2 pt-1" />
      <div className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="space-y-2">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <Settings className="h-4 w-4" /> Paramètres
        </Link>
        <CreditsCard profile={profile} credits={credits} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-line bg-bg-elevated lg:block">{sidebar()}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-72 border-r border-line bg-bg-elevated">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 rounded-lg p-2 text-muted" aria-label="Fermer le menu">
              <X className="h-4 w-4" />
            </button>
            {sidebar(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="-ml-1 rounded-lg p-2 text-muted lg:hidden" aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/settings/billing"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium text-muted transition hover:text-fg lg:hidden"
          >
            <Zap className="h-3.5 w-3.5 text-brand-text" /> {credits}
          </Link>
          <ThemePopover accent={profile.theme_accent} mode={profile.theme_mode} />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-surface-2"
              aria-label="Menu du compte"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-fg">{initials(name)}</span>
              <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{name}</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="animate-fade-up absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-2xl">
                  <div className="border-b border-line px-3 py-3">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-subtle">{email}</p>
                  </div>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                    <Settings className="h-4 w-4" /> Paramètres
                  </Link>
                  <form action={signOut}>
                    <button className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-sm text-danger hover:bg-danger/10">
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
