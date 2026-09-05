"use server";

import { revalidatePath } from "next/cache";
import type { CreateCvFromAiResult } from "@/lib/cv/ai-create-result";
import {
  cvTitleFromData,
  generateDossierCv,
  generateDossierCvFromPdf,
} from "@/lib/cv/ai-generate";
import { extractPdfText } from "@/lib/cv/extract-pdf-text";
import {
  isPdfUpload,
  MAX_IMPORT_PDF_BYTES,
  MIN_IMPORT_TEXT,
  uploadedFile,
} from "@/lib/cv/pdf-import";
import { cvDataToJson, type CvData } from "@/lib/cv/schema";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function asBase64(value: string) {
  const trimmed = value.trim();
  const comma = trimmed.indexOf(",");
  if (trimmed.startsWith("data:") && comma >= 0) {
    return trimmed.slice(comma + 1).replace(/\s/g, "");
  }
  return trimmed.replace(/\s/g, "");
}

async function readImportSource(formData: FormData) {
  const file = uploadedFile(formData.get("file"));
  let context = String(formData.get("context") ?? "").trim();
  let pdf = asBase64(String(formData.get("pdf") ?? ""));

  if (file) {
    if (file.size > MAX_IMPORT_PDF_BYTES) {
      throw new Error("El PDF pesa demasiado (máximo 6 MB).");
    }
    if (file.size < 8) {
      throw new Error("El archivo está vacío.");
    }

    if (isPdfUpload(file)) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const text = await extractPdfText(bytes);
      if (text.length >= MIN_IMPORT_TEXT) {
        context = [context, text].filter(Boolean).join("\n\n");
        pdf = "";
      } else {
        pdf = Buffer.from(bytes).toString("base64");
      }
    } else {
      const text = (await file.text()).trim();
      context = [context, text].filter(Boolean).join("\n\n");
    }
  }

  return { context, pdf };
}

async function buildCvFromImport(
  context: string,
  pdf: string,
  profile: { full_name?: string | null; email?: string | null },
): Promise<CvData> {
  if (pdf && context.length >= MIN_IMPORT_TEXT) {
    try {
      return await generateDossierCvFromPdf(pdf, profile);
    } catch (error) {
      console.error("PDF con IA:", error);
      return generateDossierCv(context, profile);
    }
  }

  if (pdf) {
    return generateDossierCvFromPdf(pdf, profile);
  }

  return generateDossierCv(context, profile);
}

export async function createCvFromAi(
  formData: FormData,
): Promise<CreateCvFromAiResult> {
  let context = "";
  let pdf = "";

  try {
    const source = await readImportSource(formData);
    context = source.context;
    pdf = source.pdf;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo leer el archivo.",
    };
  }

  if (!pdf && context.length < MIN_IMPORT_TEXT) {
    return {
      error:
        "No encontramos texto en el archivo. Prueba otro PDF o pega el contenido.",
    };
  }

  if (context.length > 50000) {
    context = context.slice(0, 50000);
  }

  if (!getSupabaseEnv().configured) {
    try {
      const data = await buildCvFromImport(context, pdf, {});
      return {
        local: true as const,
        title: cvTitleFromData(data),
        data,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo armar el currículum.",
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const profileInput = {
    full_name: profile?.full_name,
    email: profile?.email ?? user?.email,
  };

  let data: CvData;
  try {
    data = await buildCvFromImport(context, pdf, profileInput);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo armar el currículum.",
    };
  }

  if (!user) {
    return {
      local: true as const,
      title: cvTitleFromData(data),
      data,
    };
  }

  const { data: created, error } = await supabase
    .from("cvs")
    .insert({
      user_id: user.id,
      title: cvTitleFromData(data),
      data: cvDataToJson(data),
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      error: error?.message ?? "No se pudo guardar el currículum.",
    };
  }

  revalidatePath("/dashboard");
  return { id: created.id };
}
