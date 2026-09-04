"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cvTitleFromData, generateDossierCv } from "@/lib/cv/ai-generate";
import { cvDataToJson } from "@/lib/cv/schema";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function createCvFromAi(formData: FormData) {
  const context = String(formData.get("context") ?? "").trim();

  if (context.length < 40) {
    return {
      error:
        "Escribe un poco más sobre ti: oficio, experiencia, estudios y contacto.",
    };
  }

  if (context.length > 12000) {
    return { error: "El texto es demasiado largo. Recórtalo un poco." };
  }

  if (!getSupabaseEnv().configured) {
    const data = await generateDossierCv(context, {});
    return {
      local: true as const,
      title: cvTitleFromData(data),
      data,
    };
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

  const data = await generateDossierCv(context, {
    full_name: profile?.full_name,
    email: profile?.email ?? user?.email,
  });

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
  redirect(`/cv/${created.id}`);
}
