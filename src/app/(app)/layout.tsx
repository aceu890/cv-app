import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ensureUserWorkspace } from "@/lib/auth/workspace";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!getSupabaseEnv().configured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await ensureUserWorkspace(supabase, user);
  } catch (error) {
    console.error("No se pudo sincronizar el perfil:", error);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader profile={profile} />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
