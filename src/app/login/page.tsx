import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { GoogleButton } from "@/components/google-button";
import { LoginGallery } from "@/components/login-gallery";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Entrar o crear un CV sin cuenta",
  description:
    "Entra a CV FORGE con Google para guardar en la nube, o sigue sin cuenta. Creador de currículum gratis, sin publicidad y fácil de usar.",
  alternates: { canonical: "/login" },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const PROMISES = [
  {
    title: "Se ve contratable",
    text: "11 plantillas pensadas para que el reclutador se detenga en tu nombre.",
  },
  {
    title: "Listo para enviar hoy",
    text: "Exporta un PDF A4 nítido cuando quieras postular. Sin pelearte con Word.",
  },
  {
    title: "Queda a tu nombre",
    text: "Con Google, en la nube. Sin cuenta, en este navegador. Tú eliges.",
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = getSupabaseEnv().configured;

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <BrandLogo href="/" size="sm" />
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div className="order-2 lg:order-1">
          <LoginGallery />
        </div>

        <div className="order-1 w-full rounded-[1.7rem] border border-line bg-cream/90 p-6 shadow-[var(--shadow)] sm:p-8 lg:order-2">
          <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Empieza ahora
          </p>
          <h1 className="mt-3 font-serif text-[2.15rem] leading-[1.08] tracking-tight sm:text-4xl">
            Crea el CV que abre puertas.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Entra con Google para guardar en la nube. O sigue sin cuenta: el CV
            queda en este navegador y puedes exportar el PDF igual.
          </p>

          {params.error ? (
            <p className="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              No se pudo completar el acceso. Comprueba que Google esté activo en
              Supabase y vuelve a intentarlo.
            </p>
          ) : null}

          <div className="mt-7">
            <GoogleButton
              next={params.next || "/dashboard"}
              label="Crear mi currículum con Google"
            />
            <p className="mt-3 text-center text-sm text-muted">
              Gratis. Un clic. Sin inventar otra contraseña.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-field"
            >
              Seguir sin cuenta
            </Link>
          </div>

          <ul className="mt-8 space-y-4 border-t border-line/80 pt-6">
            {PROMISES.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {!configured ? (
            <p className="mt-6 text-sm text-muted">
              Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{" "}
              <code>.env.local</code>.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
