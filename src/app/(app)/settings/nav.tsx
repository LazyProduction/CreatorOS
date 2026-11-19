"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/settings", label: "Profil & apparence" },
  { href: "/settings/billing", label: "Abonnement & crédits" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-line">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={cn("relative h-10 px-4 text-sm leading-10 transition", pathname === i.href ? "font-medium text-fg" : "text-muted hover:text-fg")}>
          {i.label}
          {pathname === i.href && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
        </Link>
      ))}
    </div>
  );
}
