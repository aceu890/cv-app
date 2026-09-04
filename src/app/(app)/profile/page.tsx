import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { getCachedUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const { supabase, user } = await getCachedUser();

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
      <p className="rounded-2xl border border-line bg-cream px-4 py-3 text-muted">
        No se encontró el perfil. Ejecuta <code>supabase/schema.sql</code> y
        vuelve a entrar con Google.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
        Cuenta
      </p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">
        Tu perfil
      </h1>
      <p className="mt-2 text-muted">
        Los currículums y cada cambio quedan vinculados a esta cuenta.
      </p>
      <div className="mt-8 rounded-[1.5rem] border border-line bg-cream/90 p-6 shadow-[var(--shadow)]">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="size-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-xl text-on-accent">
              {(profile.full_name || profile.email || "U")
                .slice(0, 1)
                .toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-medium">{profile.full_name || "Sin nombre"}</p>
            <p className="text-sm text-muted">{profile.email}</p>
          </div>
        </div>
        <div className="mt-8">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
