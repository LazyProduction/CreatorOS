import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CreatorOS : l'espace de travail IA des créateurs de contenu",
    template: "%s · CreatorOS",
  },
  description:
    "Idées, titres, hooks, scripts, descriptions, tags et branding générés par l'IA, pipeline Kanban, téléprompteur et suivi des publications. Tout ton workflow de créateur au même endroit.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#07060d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" className={`${inter.variable} ${grotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)" },
          }}
        />
      </body>
    </html>
  );
}
