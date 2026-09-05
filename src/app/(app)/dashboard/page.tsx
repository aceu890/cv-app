import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard-home";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCachedUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Crear currículum online",
  description:
    "Empieza tu CV ahora. Gratis, sin publicidad y con o sin cuenta. Elige plantilla y exporta a PDF.",
  alternates: { canonical: "/dashboard" },
};

export default async function DashboardPage() {
  if (!getSupabaseEnv().configured) {
    return <DashboardHome signedIn={false} cloudCvs={[]} />;
  }

  const { supabase, user } = await getCachedUser();

  if (!user) {
    return <DashboardHome signedIn={false} cloudCvs={[]} />;
  }

  const { data: cvs, error } = await supabase
    .from("cvs")
    .select("id, title, updated_at, data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <DashboardHome
      signedIn
      cloudCvs={cvs ?? []}
      cloudError={error?.message}
    />
  );
}
