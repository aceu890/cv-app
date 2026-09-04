import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VisualTests } from "@/components/visual-tests";
import { createClient } from "@/lib/supabase/server";
import { runServerChecks } from "@/lib/tests/run-server";

export const metadata: Metadata = {
  title: "Test visual — Folio",
  description:
    "Live checks for auth, RLS, CV schema, templates, and PDF export.",
};

export default async function TestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initial = await runServerChecks(supabase, user);

  return <VisualTests initial={initial} />;
}
