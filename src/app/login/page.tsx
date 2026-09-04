import Link from "next/link";
import { GoogleButton } from "@/components/google-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseEnv } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = getSupabaseEnv().configured;

  return (
    <div className="flex min-h-full flex-col px-4 py-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-line bg-cream p-6 sm:p-8">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Folio
          </Link>
          <h1 className="mt-6 font-serif text-3xl">Entrar con Google</h1>
          <p className="mt-3 text-muted">
            Usamos tu cuenta de Google para crear tu perfil y guardar cada
            currículum a tu nombre.
          </p>
          {params.error ? (
            <p className="mt-4 text-sm text-danger">
              No se pudo completar el acceso. Comprueba que Google esté activo en
              Supabase y vuelve a intentarlo.
            </p>
          ) : null}
          <div className="mt-8">
            <GoogleButton next={params.next || "/dashboard"} />
          </div>
          {!configured ? (
            <p className="mt-4 text-sm text-muted">
              Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code>.env.local</code>.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
