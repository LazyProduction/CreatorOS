import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, credits: 0 } as const;
  const [{ data: profile }, { data: credits }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.rpc("get_credits"),
  ]);
  return { supabase, user, profile, credits: (credits as number | null) ?? 0 } as const;
});

export async function requireSession() {
  const s = await getSession();
  if (!s.user || !s.profile) redirect("/login");
  return s as typeof s & { user: NonNullable<typeof s.user>; profile: Profile };
}
