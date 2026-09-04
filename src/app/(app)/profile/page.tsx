import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <p className="text-muted">
        No se encontró el perfil. Ejecuta <code>supabase/schema.sql</code> y
        vuelve a entrar con Google.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Tu perfil</h1>
      <p className="mt-2 text-muted">
        Los currículums y cada cambio que hagas quedan vinculados a esta cuenta.
      </p>
      <div className="mt-8 flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div>
          <p className="font-medium">{profile.full_name || "Sin nombre"}</p>
          <p className="text-sm text-muted">{profile.email}</p>
        </div>
      </div>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
