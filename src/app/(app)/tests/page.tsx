import type { Metadata } from "next";
import { VisualTests } from "@/components/visual-tests";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCachedUser } from "@/lib/supabase/session";
import { runServerChecks } from "@/lib/tests/run-server";
import type { LocalizedText, VisualCheck } from "@/lib/tests/types";

export const metadata: Metadata = {
  title: "Tests visuales",
  description: "Comprobaciones internas de CV FORGE.",
  robots: { index: false, follow: false },
};

function guestCheck(
  id: VisualCheck["id"],
  group: VisualCheck["group"],
  detail: LocalizedText,
): VisualCheck {
  return { id, group, status: "pass", detail };
}

export default async function TestsPage() {
  if (!getSupabaseEnv().configured) {
    return (
      <VisualTests
        initial={[
          guestCheck("session", "auth", {
            en: "Guest mode. Cloud checks skipped.",
            es: "Modo invitado. Sin comprobaciones de nube.",
          }),
        ]}
      />
    );
  }

  const { supabase, user } = await getCachedUser();

  if (!user) {
    return (
      <VisualTests
        initial={[
          guestCheck("session", "auth", {
            en: "Guest mode. You can edit CVs in this browser.",
            es: "Modo invitado. Puedes editar CVs en este navegador.",
          }),
        ]}
      />
    );
  }

  const initial = await runServerChecks(supabase, user);

  return <VisualTests initial={initial} />;
}
