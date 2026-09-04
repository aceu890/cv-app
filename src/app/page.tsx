import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { HomeJsonLd } from "@/components/json-ld";
import {
  LandingHeaderAuth,
  LandingMainAuth,
} from "@/components/landing-auth";
import { LandingSeo } from "@/components/landing-seo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    absolute: "Creador de currículum gratis y sin publicidad | CV FORGE",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const TRUST = [
  "Gratis",
  "Sin publicidad",
  "Sin fines de lucro",
  "Con o sin cuenta",
  "Fácil de usar",
];

export default function HomePage() {
  const { configured } = getSupabaseEnv();

  return (
    <div className="flex min-h-full flex-col">
      <HomeJsonLd />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/" size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LandingHeaderAuth />
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div className="max-w-xl">
            <p className="inline-flex rounded-full border border-line bg-cream/80 px-3 py-1 text-xs font-medium tracking-[0.16em] text-accent uppercase">
              Creador de currículum gratis
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Crea tu CV, hoja de vida o resume. Sin pagar ni ver anuncios.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              {SITE_NAME} es un editor de currículum online, sin fines de lucro
              y fácil de usar. Entra con o sin cuenta, elige una plantilla y
              descarga un PDF A4 profesional.
            </p>
            <div className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
              <LandingMainAuth />
            </div>
            <ul className="mt-8 flex flex-wrap gap-2 text-sm">
              {TRUST.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-cream/70 px-3 py-1.5 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
            {!configured ? (
              <p className="mt-4 max-w-md text-sm text-muted">
                Para activar el guardado en la nube, copia{" "}
                <code>.env.example</code> a <code>.env.local</code> y añade las
                claves de Supabase.
              </p>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-line bg-cream p-3 shadow-[var(--shadow)] sm:p-4">
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <span className="size-2 rounded-full bg-line" />
                <span className="size-2 rounded-full bg-line" />
                <span className="size-2 rounded-full bg-line" />
                <span className="ml-2 text-xs text-muted">
                  Vista previa de un currículum A4
                </span>
              </div>
              <div className="bg-white px-7 py-8 font-serif text-black">
                <p className="text-center text-xl font-semibold tracking-wide uppercase">
                  Matías Correa Salinas
                </p>
                <p className="mt-1.5 text-center text-[10.5px]">
                  Santiago, Chile | +56 9 8765 4321 | matias.correa@correo.cl
                </p>
                <p className="mt-5 border-b border-black pb-[3px] text-[11px] font-bold tracking-[0.12em] uppercase">
                  Perfil profesional
                </p>
                <p className="mt-2 text-[11.5px] leading-relaxed">
                  Desarrollador full-stack con experiencia en productos web
                  para logística y operaciones. Busco un rol de punta a punta.
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
                    Subí la conversión de onboarding de 41% a 63% en cuatro
                    meses.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <LandingSeo />
      </main>
    </div>
  );
}
