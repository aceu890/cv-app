import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreateCvButton,
  CreateExampleCvButton,
  CreateFernandoCvButton,
} from "@/components/create-cv-button";
import { DeleteCvButton } from "@/components/delete-cv-button";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cvs, error } = await supabase
    .from("cvs")
    .select("id, title, updated_at, data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Tus currículums
          </h1>
          <p className="mt-2 text-muted">
            Formato Harvard u otras 9 plantillas con layout distinto. Cada CV
            queda asociado a tu perfil de Google.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <CreateFernandoCvButton />
          <CreateExampleCvButton />
          <CreateCvButton />
        </div>
      </div>

      {error ? (
        <p className="mt-8 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          No se pudieron cargar los CVs. Ejecuta <code>supabase/schema.sql</code>{" "}
          en el SQL Editor de tu proyecto. {error.message}
        </p>
      ) : null}

      {!error && (!cvs || cvs.length === 0) ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-cream px-6 py-12 text-center">
          <p className="font-serif text-2xl">Aún no tienes ningún CV</p>
          <p className="mt-2 text-muted">Crea el primero y empieza a editarlo.</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
            <CreateFernandoCvButton />
            <CreateExampleCvButton />
            <CreateCvButton label="Crear mi CV" />
          </div>
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cvs?.map((cv) => (
          <li
            key={cv.id}
            className="rounded-2xl border border-line bg-cream p-5"
          >
            <Link href={`/cv/${cv.id}`} className="block">
              <h2 className="font-serif text-2xl">{cv.title}</h2>
              <p className="mt-2 text-sm text-muted">
                Actualizado {formatDate(cv.updated_at)}
              </p>
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <Link
                href={`/cv/${cv.id}`}
                className="text-sm text-accent hover:underline"
              >
                Editar
              </Link>
              <DeleteCvButton id={cv.id} title={cv.title} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
