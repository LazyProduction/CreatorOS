import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ThemeSync } from "@/components/theme-picker";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, credits } = await requireSession();
  if (!profile.onboarded) redirect("/onboarding");
  return (
    <>
      <ThemeSync accent={profile.theme_accent} mode={profile.theme_mode} />
      <AppShell profile={profile} credits={credits} email={user.email ?? ""}>
        {children}
      </AppShell>
    </>
  );
}
