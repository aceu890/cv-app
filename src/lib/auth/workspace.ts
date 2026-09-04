import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createDefaultCvData, cvDataToJson } from "@/lib/cv/schema";
import type { Database } from "@/lib/supabase/database.types";

export async function ensureUserWorkspace(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const fullName =
    (typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : undefined) ||
    (typeof user.user_metadata.name === "string"
      ? user.user_metadata.name
      : "") ||
    "";
  const avatarUrl =
    (typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : undefined) ||
    (typeof user.user_metadata.picture === "string"
      ? user.user_metadata.picture
      : null);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName || null,
    avatar_url: avatarUrl,
  });

  if (profileError) {
    throw profileError;
  }

  const { count, error: countError } = await supabase
    .from("cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    throw countError;
  }

  if (!count) {
    const { error: cvError } = await supabase.from("cvs").insert({
      user_id: user.id,
      title: "Mi CV",
      data: cvDataToJson(
        createDefaultCvData({
          full_name: fullName,
          email: user.email ?? null,
        }),
      ),
    });

    if (cvError) {
      throw cvError;
    }
  }
}
