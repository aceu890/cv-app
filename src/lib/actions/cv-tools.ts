"use server";

import { revalidatePath } from "next/cache";
import { generateDossierCv, cvTitleFromData } from "@/lib/cv/ai-generate";
import { extractPdfText } from "@/lib/cv/extract-pdf-text";
import {
  isPdfUpload,
  MAX_IMPORT_PDF_BYTES,
  MIN_IMPORT_TEXT,
  uploadedFile,
} from "@/lib/cv/pdf-import";
import {
  buildInterviewKitData,
  reviewAtsData,
  tailorCvData,
  writeCoverLetterData,
} from "@/lib/cv/ai-tools";
import {
  cvDataToJson,
  parseCvData,
  type CvData,
  type JobSource,
} from "@/lib/cv/schema";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function asSource(value: string): JobSource {
  if (
    value === "linkedin" ||
    value === "computrabajo" ||
    value === "getonboard"
  ) {
    return value;
  }
  return "otro";
}

export async function tailorCvAction(input: {
  data: CvData;
  title: string;
  cvId: string;
  jobTitle: string;
  company: string;
  source: string;
  posting: string;
}) {
  const posting = input.posting.trim();
  if (posting.length < 40) {
    return { error: "Pega el aviso completo: requisitos, stack y tareas." };
  }

  const data = await tailorCvData(parseCvData(input.data), {
    title: input.jobTitle.trim(),
    company: input.company.trim(),
    source: asSource(input.source),
    posting,
    parentId: input.cvId,
    parentTitle: input.title,
  });

  const title = [
    input.jobTitle.trim() || data.personal.title,
    input.company.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  return saveNewCv(title.slice(0, 80) || "CV para aviso", data);
}

export async function coverLetterAction(input: {
  data: CvData;
  jobTitle: string;
  company: string;
  recipient: string;
}) {
  const letter = await writeCoverLetterData(parseCvData(input.data), {
    title: input.jobTitle.trim(),
    company: input.company.trim(),
    recipient: input.recipient.trim(),
  });
  return { letter };
}

export async function atsReviewAction(input: { data: CvData; posting: string }) {
  const report = await reviewAtsData(parseCvData(input.data), input.posting);
  return { report };
}

export async function interviewKitAction(input: { data: CvData }) {
  const kit = await buildInterviewKitData(parseCvData(input.data));
  return { kit };
}

export async function importCvAction(formData: FormData) {
  const file = uploadedFile(formData.get("file"));
  let context = String(formData.get("context") ?? "").trim();

  try {
    if (file) {
      if (file.size > MAX_IMPORT_PDF_BYTES) {
        return { error: "El PDF pesa demasiado (máximo 6 MB)." };
      }
      if (isPdfUpload(file)) {
        context = await extractPdfText(await file.arrayBuffer());
      } else {
        context = (await file.text()).trim();
      }
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo leer el archivo.",
    };
  }

  if (context.length < MIN_IMPORT_TEXT) {
    return { error: "Pega el texto de LinkedIn o de tu CV." };
  }

  try {
    const data = await generateDossierCv(context, {
      full_name: null,
      email: null,
    });
    return saveNewCv(cvTitleFromData(data), data);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo importar el CV.",
    };
  }
}

export async function publishCvAction(input: {
  title: string;
  data: CvData;
  slug?: string;
}) {
  if (!getSupabaseEnv().configured) {
    return {
      error:
        "Para el link público configura Supabase y ejecuta supabase/public-shares.sql.",
    };
  }

  const slug =
    input.slug?.replace(/[^a-z0-9-]/gi, "").toLowerCase() ||
    crypto.randomUUID().replace(/-/g, "").slice(0, 10);

  const supabase = await createClient();
  const payload = {
    slug,
    title: input.title.trim() || "Currículum",
    payload: cvDataToJson(parseCvData(input.data)),
  };

  const { error } = await supabase.from("public_shares").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    return {
      error: `No se pudo publicar. Ejecuta supabase/public-shares.sql en Supabase. ${error.message}`,
    };
  }

  revalidatePath(`/u/${slug}`);
  return { slug };
}

export async function saveNewCv(title: string, data: CvData) {
  if (!getSupabaseEnv().configured) {
    return { local: true as const, title, data };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { local: true as const, title, data };
  }

  const { data: created, error } = await supabase
    .from("cvs")
    .insert({
      user_id: user.id,
      title,
      data: cvDataToJson(data),
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      error: error?.message ?? "No se pudo guardar la versión.",
    };
  }

  revalidatePath("/dashboard");
  return { id: created.id, title, data };
}
