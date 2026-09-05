"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleButton } from "@/components/google-button";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function LandingHeaderAuth() {
  const signedIn = useLandingSignedIn();

  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className="rounded-full bg-solid px-4 py-2.5 text-sm text-on-solid transition-colors hover:bg-accent-hover hover:text-on-accent"
      >
        Ir al panel
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/dashboard"
        className="min-h-11 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-cream hover:text-ink"
      >
        Empezar
      </Link>
      <Link
        href="/login"
        className="min-h-11 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-cream hover:text-ink"
      >
        Entrar
      </Link>
    </div>
  );
}

export function LandingMainAuth() {
  const signedIn = useLandingSignedIn();

  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-solid px-5 py-3 text-sm font-medium text-on-solid sm:w-auto"
      >
        Continuar editando
      </Link>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Link
        href="/dashboard"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-solid px-5 py-3 text-sm font-medium text-on-solid"
      >
        Empezar sin cuenta
      </Link>
      <GoogleButton label="Guardar en la nube" variant="line" />
    </div>
  );
}

function useLandingSignedIn() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!getSupabaseEnv().configured) {
      return;
    }

    try {
      const supabase = createClient();
      supabase.auth
        .getSession()
        .then(({ data }) => setSignedIn(Boolean(data.session)))
        .catch(() => setSignedIn(false));
    } catch {
      setSignedIn(false);
    }
  }, []);

  return signedIn;
}
