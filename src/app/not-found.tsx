import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="ambient flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold text-brand-text">404</p>
      <p className="mt-3 text-muted">Cette page n'existe pas (ou plus).</p>
      <Link href="/" className={buttonClass("primary", "md", "mt-6")}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
