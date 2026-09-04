"use server";

import { createClient } from "@/lib/supabase/server";
import { runServerChecks } from "@/lib/tests/run-server";
import type { VisualCheck } from "@/lib/tests/types";

export async function rerunVisualChecks(): Promise<VisualCheck[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [
      {
        id: "session",
        group: "auth",
        status: "pass",
        detail: {
          en: "Guest mode. You can edit CVs in this browser.",
          es: "Modo invitado. Puedes editar CVs en este navegador.",
        },
      },
    ];
  }

  return runServerChecks(supabase, user);
}
