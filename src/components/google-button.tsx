"use client";

import { useState } from "react";
import {
  LOCAL_CALLBACK_URL,
  LOCAL_CALLBACK_WILDCARD,
  getOAuthCallbackUrl,
  rememberAuthNext,
} from "@/lib/dev-mode";
import { useDevMode } from "@/lib/use-dev-mode";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type GoogleButtonProps = {
  next?: string;
  label?: string;
  hint?: boolean;
  variant?: "solid" | "line";
};

export function GoogleButton({
  next = "/dashboard",
  label = "Continuar con Google",
  hint = false,
  variant = "solid",
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { on: devMode } = useDevMode();
  const configured = getSupabaseEnv().configured;
  const returnTo = hint ? getOAuthCallbackUrl(devMode) : "";

  async function signIn() {
    if (!configured) {
      setError(
        "Falta configurar Supabase. Copia .env.example a .env.local y añade las claves.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const callbackUrl = getOAuthCallbackUrl();
      rememberAuthNext(next);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError || !data.url) {
        setError(oauthError?.message ?? "No se pudo iniciar sesión con Google.");
        setLoading(false);
        return;
      }

      const authorize = new URL(data.url);
      authorize.searchParams.set("redirect_to", callbackUrl);
      window.location.assign(authorize.toString());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo iniciar sesión con Google.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className={
          variant === "line"
            ? "inline-flex w-full items-center justify-center gap-3 rounded-full border border-line bg-transparent px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-field disabled:cursor-not-allowed disabled:opacity-70"
            : "inline-flex w-full items-center justify-center gap-3 rounded-full bg-solid px-5 py-3 text-sm font-medium text-on-solid transition-colors hover:bg-accent-hover hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        <GoogleMark />
        {loading ? "Redirigiendo a Google…" : label}
      </button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {returnTo ? (
        <div className="space-y-1 text-center text-xs text-muted">
          <p>Después de Google vuelves a {returnTo.replace(/^https?:\/\//, "")}</p>
          {returnTo.startsWith("http://localhost") ||
          returnTo.startsWith("http://127.0.0.1") ? (
            <p className="leading-relaxed">
              En Supabase → Authentication → URL Configuration añade estas
              Redirect URLs. Si faltan, Google te manda a producción.
              <br />
              <code className="text-ink">{LOCAL_CALLBACK_URL}</code>
              <br />
              <code className="text-ink">{LOCAL_CALLBACK_WILDCARD}</code>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
