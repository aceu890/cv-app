import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { ensureUserWorkspace } from "@/lib/auth/workspace";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCachedUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  let profile: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null = null;

  if (getSupabaseEnv().configured) {
    const { supabase, user } = await getCachedUser();

    if (user) {
      const first = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      profile = first.data;

      if (!profile) {
        try {
          await ensureUserWorkspace(supabase, user);
          const retry = await supabase
            .from("profiles")
            .select("id, email, full_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();
          profile = retry.data;
        } catch (error) {
          console.error("No se pudo sincronizar el perfil:", error);
        }
      }
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={profile} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-10">
        {children}
      </div>
    </div>
  );
}
