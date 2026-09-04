"use client";

import { useFormStatus } from "react-dom";
import { updateProfile } from "@/lib/actions/account";
import type { Profile } from "@/lib/supabase/database.types";

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={updateProfile} className="max-w-lg space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
          Nombre
        </span>
        <input
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          className="field"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
          Email de Google
        </span>
        <input
          value={profile.email ?? ""}
          readOnly
          className="field bg-line/30 text-muted"
        />
      </label>
      <SaveProfileButton />
    </form>
  );
}

function SaveProfileButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar perfil"}
    </button>
  );
}
