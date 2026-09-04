import Link from "next/link";
import { GoogleButton } from "@/components/google-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const { configured } = getSupabaseEnv();
  let signedIn = false;

  if (configured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      signedIn = Boolean(user);
    } catch {
      signedIn = false;
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <p className="font-serif text-2xl tracking-tight">Folio</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-ink px-4 py-2.5 text-sm text-paper"
            >
              Ir al panel
            </Link>
          ) : (
            <Link
              href="/login"
              className="min-h-11 px-3 py-2 text-sm text-muted hover:text-ink"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div className="max-w-xl">
          <p className="text-sm tracking-[0.18em] text-accent uppercase">
            Currículum en la nube
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Tu CV, ligado a tu cuenta de Google.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            Entra con Google, elige entre 10 plantillas con estructuras
            distintas y guarda cada versión en tu perfil. Exporta a PDF cuando
            esté listo.
          </p>
          <div className="mt-8 max-w-sm">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper sm:w-auto"
              >
                Continuar editando
              </Link>
            ) : (
              <GoogleButton />
            )}
          </div>
          {!configured ? (
            <p className="mt-4 max-w-md text-sm text-muted">
              Para activar el registro, copia <code>.env.example</code> a{" "}
              <code>.env.local</code>, añade las claves de Supabase y ejecuta{" "}
              <code>supabase/schema.sql</code> en el SQL Editor.
            </p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-cream p-4 shadow-[0_20px_60px_-40px_rgba(28,25,21,0.45)] sm:p-6">
          <div className="bg-white px-7 py-8 font-serif text-black">
            <p className="text-center text-xl font-semibold tracking-wide uppercase">
              Matías Correa Salinas
            </p>
            <p className="mt-1.5 text-center text-[10.5px]">
              Santiago, Chile  |  +56 9 8765 4321  |  matias.correa@correo.cl
            </p>
            <p className="mt-5 border-b border-black pb-[3px] text-[11px] font-bold tracking-[0.12em] uppercase">
              Perfil profesional
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed">
              Desarrollador full-stack con experiencia en productos web para
              logística y operaciones. Busco un rol de punta a punta.
            </p>
            <p className="mt-5 border-b border-black pb-[3px] text-[11px] font-bold tracking-[0.12em] uppercase">
              Experiencia profesional
            </p>
            <p className="mt-2 text-[12px] font-bold">
              Nimbus Labs — Santiago, Chile
            </p>
            <p className="text-[11.5px]">Desarrollador Full-Stack</p>
            <p className="text-[11px]">abr 2023 – Actual</p>
            <ul className="mt-1 list-disc pl-[18px] text-[11.5px] leading-relaxed">
              <li>
                Subí la conversión de onboarding de 41% a 63% en cuatro meses.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
