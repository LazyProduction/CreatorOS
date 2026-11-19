import { PageHeader } from "@/components/app-shell";
import { SettingsNav } from "./nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Paramètres" />
      <SettingsNav />
      {children}
    </div>
  );
}
