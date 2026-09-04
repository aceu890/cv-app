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
import type { LocalizedText, VisualCheck } from "@/lib/tests/types";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function check(
  id: VisualCheck["id"],
  group: VisualCheck["group"],
  ok: boolean,
  detail: LocalizedText,
): VisualCheck {
  return {
    id,
    group,
    status: ok ? "pass" : "fail",
    detail,
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

  const uniqueIds = new Set(CV_TEMPLATES.map((item) => item.id));
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
  const cvCount = cvs?.length ?? 0;

  return [
    check("session", "auth", Boolean(user.id && user.email), {
      en: user.email ?? "Signed in.",
      es: user.email ?? "Sesión iniciada.",
    }),
    check(
      "env",
      "auth",
      env.configured && env.url.includes("supabase.co"),
      env.configured
        ? {
            en: "The public server URL and key are defined.",
            es: "La dirección pública del servidor y la clave están definidas.",
          }
        : {
            en: "The server variables are missing.",
            es: "Faltan las variables del servidor.",
          },
    ),
    check(
      "profile",
      "data",
      Boolean(profile?.id === user.id && !profileError),
      profile && !profileError
        ? {
            en: `The profile id matches this account${profile.email ? ` (${profile.email})` : ""}.`,
            es: `El identificador del perfil coincide con esta cuenta${profile.email ? ` (${profile.email})` : ""}.`,
          }
        : {
            en: "There is no profile row for this account.",
            es: "No hay fila de perfil para esta cuenta.",
          },
    ),
    check("rlsRead", "data", !cvsError && !foreignRow, {
      en: cvsError
        ? "The CV query failed."
        : foreignRow
          ? "The query returned a row from another user."
          : `${cvCount} CV(s) for this account. No foreign rows.`,
      es: cvsError
        ? "Falló la consulta de currículums."
        : foreignRow
          ? "La consulta devolvió una fila de otra cuenta."
          : `${cvCount} currículum(s) de esta cuenta. Ninguna fila ajena.`,
    }),
    check(
      "storedSchema",
      "schema",
      schemaOk,
      schemaOk
        ? cvCount
          ? {
              en: `${parsed.length} saved document(s) match the résumé contract.`,
              es: `${parsed.length} documento(s) guardado(s) cumplen el contrato del currículum.`,
            }
          : {
              en: "No CVs yet; the parser and contract are still available.",
              es: "Aún no hay currículums; el análisis y el contrato siguen disponibles.",
            }
        : {
            en: "A saved CV does not match the résumé contract.",
            es: "Algún currículum guardado no cumple el contrato.",
          },
    ),
    check(
      "templates",
      "schema",
      templatesOk,
      templatesOk
        ? {
            en: `${CV_TEMPLATES.length} unique ids. An unknown id falls back to Harvard.`,
            es: `${CV_TEMPLATES.length} identificadores únicos. Uno desconocido cae a Harvard.`,
          }
        : {
            en: "Templates are missing or the unknown-id fallback failed.",
            es: "Faltan plantillas o el respaldo de identificador no funciona.",
          },
    ),
    check(
      "factories",
      "schema",
      factoriesOk,
      factoriesOk
        ? {
            en: "The empty CV and the sample CV match the résumé contract.",
            es: "El currículum vacío y el de ejemplo cumplen el contrato.",
          }
        : {
            en: "The CV factories do not match the contract.",
            es: "Las fábricas de currículum no cumplen el contrato.",
          },
    ),
    check(
      "pdfName",
      "export",
      pdfNameOk,
      pdfNameOk
        ? { en: file, es: file }
        : {
            en: "The PDF filename was not cleaned.",
            es: "No se limpió el nombre del archivo PDF.",
          },
    ),
    check(
      "a4",
      "ui",
      A4_WIDTH_PX === 794 && A4_HEIGHT_PX === 1123,
      A4_WIDTH_PX === 794 && A4_HEIGHT_PX === 1123
        ? {
            en: `${A4_WIDTH_PX}×${A4_HEIGHT_PX} px.`,
            es: `${A4_WIDTH_PX} por ${A4_HEIGHT_PX} píxeles.`,
          }
        : {
            en: "The A4 constants do not match the sheet.",
            es: "Las medidas A4 no coinciden con la hoja.",
          },
    ),
  ];
}
