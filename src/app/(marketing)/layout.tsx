import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  return (
    <div className="ambient min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/#fonctionnalites" className="hidden px-3 text-sm text-muted hover:text-fg sm:block">
              Fonctionnalités
            </Link>
            <Link href="/#tarifs" className="hidden px-3 text-sm text-muted hover:text-fg sm:block">
              Tarifs
            </Link>
            {user ? (
              <Link href="/dashboard" className={buttonClass("primary", "sm")}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 text-sm text-muted hover:text-fg">
                  Connexion
                </Link>
                <Link href="/signup" className={buttonClass("primary", "sm")}>
                  Essai gratuit
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs text-subtle">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/mentions-legales" className="hover:text-fg">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-fg">
              CGV
            </Link>
            <Link href="/confidentialite" className="hover:text-fg">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
