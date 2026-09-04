"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDefaultCvData, cvDataToJson } from "@/lib/cv/schema";
import {
  EXAMPLE_CV_TITLE,
  createFullStackExampleCv,
} from "@/lib/cv/example";
import {
  FERNANDO_CV_TITLE,
  createFernandoCvData,
} from "@/lib/cv/fernando";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createCv() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { count } = await supabase
    .from("cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const title = count && count > 0 ? `Mi CV ${count + 1}` : "Mi CV";

  const { data, error } = await supabase
    .from("cvs")
    .insert({
      user_id: user.id,
      title,
      data: cvDataToJson(
        createDefaultCvData({
          full_name: profile?.full_name,
          email: profile?.email ?? user.email,
        }),
      ),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el currículum.");
  }

  revalidatePath("/dashboard");
  redirect(`/cv/${data.id}`);
}

export async function createFernandoCv() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload = {
    title: FERNANDO_CV_TITLE,
    data: cvDataToJson(createFernandoCvData()),
  };

  const { data: existing } = await supabase
    .from("cvs")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", FERNANDO_CV_TITLE)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cvs")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    redirect(`/cv/${existing.id}`);
  }

  const { data, error } = await supabase
    .from("cvs")
    .insert({
      user_id: user.id,
      ...payload,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear tu CV.");
  }

  revalidatePath("/dashboard");
  redirect(`/cv/${data.id}`);
}

export async function createExampleCv() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("cvs")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", EXAMPLE_CV_TITLE)
    .maybeSingle();

  if (existing) {
    redirect(`/cv/${existing.id}`);
  }

  const { data, error } = await supabase
    .from("cvs")
    .insert({
      user_id: user.id,
      title: EXAMPLE_CV_TITLE,
      data: cvDataToJson(createFullStackExampleCv()),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el CV de ejemplo.");
  }

  revalidatePath("/dashboard");
  redirect(`/cv/${data.id}`);
}

export async function deleteCv(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("cvs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
