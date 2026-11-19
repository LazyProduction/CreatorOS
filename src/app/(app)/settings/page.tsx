import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const { profile, user } = await requireSession();
  return <ProfileForm profile={profile} email={user.email ?? ""} />;
}
