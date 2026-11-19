import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { OnboardingFlow } from "./flow";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function OnboardingPage() {
  const { profile } = await requireSession();
  return <OnboardingFlow profile={profile} />;
}
