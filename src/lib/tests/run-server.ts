import type { User } from "@supabase/supabase-js";
import { createFullStackExampleCv } from "@/lib/cv/example";
import { A4_HEIGHT_PX, A4_WIDTH_PX, cvFileName } from "@/lib/cv/pdf";
import {
  createDefaultCvData,
  parseCvData,
  type CvData,
} from "@/lib/cv/schema";
import { CV_TEMPLATES, parseTemplateId } from "@/lib/cv/templates";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { createClient } from "@/lib/supabase/server";
import type { VisualCheck } from "@/lib/tests/types";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function check(
  id: VisualCheck["id"],
  group: VisualCheck["group"],
  ok: boolean,
  pass: string,
  fail: string,
): VisualCheck {
  return {
    id,
    group,
    status: ok ? "pass" : "fail",
    detail: ok ? pass : fail,
  };
}

function isValidCv(data: CvData) {
  return Boolean(
    data.template &&
      data.personal &&
      Array.isArray(data.experience) &&
      Array.isArray(data.education) &&
      Array.isArray(data.skills),
  );
}

export async function runServerChecks(
  supabase: ServerClient,
  user: User,
): Promise<VisualCheck[]> {
  const env = getSupabaseEnv();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: cvs, error: cvsError } = await supabase
    .from("cvs")
    .select("id, user_id, data")
    .eq("user_id", user.id);

  const foreignRow = cvs?.some((row) => row.user_id !== user.id) ?? false;
  const parsed = (cvs ?? []).map((row) => parseCvData(row.data));
  const schemaOk =
    !cvsError && (cvs?.length ?? 0) === 0
      ? true
      : parsed.length === (cvs?.length ?? 0) && parsed.every(isValidCv);

  const ids = CV_TEMPLATES.map((item) => item.id);
  const uniqueIds = new Set(ids);
  const templatesOk =
    CV_TEMPLATES.length === 11 &&
    uniqueIds.size === 11 &&
    parseTemplateId("dossier") === "dossier" &&
    parseTemplateId("no-existe") === "folio";

  const empty = createDefaultCvData({
    full_name: user.user_metadata.full_name,
    email: user.email,
  });
  const example = createFullStackExampleCv();
  const exampleRoundtrip = parseCvData(JSON.parse(JSON.stringify(example)));
  const factoriesOk =
    isValidCv(empty) &&
    empty.template === "folio" &&
    example.experience.length > 0 &&
    exampleRoundtrip.personal.fullName === example.personal.fullName;

  const file = cvFileName("Fernando Soto · Full-Stack", "Andrés");
  const pdfNameOk = file.endsWith(".pdf") && !/\s/.test(file);

  return [
    check(
      "session",
      "auth",
      Boolean(user.id && user.email),
      `${user.email}`,
      "No hay usuario en la sesión.",
    ),
    check(
      "env",
      "auth",
      env.configured && env.url.includes("supabase.co"),
      "NEXT_PUBLIC_SUPABASE_URL y la publishable key están definidas.",
      "Faltan las variables de Supabase.",
    ),
    check(
      "profile",
      "data",
      Boolean(profile?.id === user.id && !profileError),
      profile?.email
        ? `profiles.id coincide con auth.users (${profile.email}).`
        : "Perfil encontrado.",
      profileError?.message || "No hay fila en profiles para esta cuenta.",
    ),
    check(
      "rlsRead",
      "data",
      !cvsError && !foreignRow,
      `${cvs?.length ?? 0} CV(s) de este user_id. Ninguna fila ajena.`,
      cvsError?.message || "La consulta devolvió filas de otro usuario.",
    ),
    check(
      "storedSchema",
      "schema",
      schemaOk,
      cvs?.length
        ? `${parsed.length} documento(s) parseados como CvData.`
        : "Sin CVs aún; el parser y el contrato siguen disponibles.",
      "Algún CV guardado no cumple el contrato CvData.",
    ),
    check(
      "templates",
      "schema",
      templatesOk,
      `${CV_TEMPLATES.length} ids únicos. parseTemplateId("no-existe") → folio.`,
      "Faltan plantillas o el fallback de id no funciona.",
    ),
    check(
      "factories",
      "schema",
      factoriesOk,
      "createDefaultCvData y el CV de ejemplo cumplen CvData.",
      "Las fábricas de CV no cumplen el esquema.",
    ),
    check(
      "pdfName",
      "export",
      pdfNameOk,
      file,
      "cvFileName no sanitizó el nombre.",
    ),
    check(
      "a4",
      "ui",
      A4_WIDTH_PX === 794 && A4_HEIGHT_PX === 1123,
      `${A4_WIDTH_PX}×${A4_HEIGHT_PX} px.`,
      "Las constantes A4 no coinciden con la hoja.",
    ),
  ];
}
