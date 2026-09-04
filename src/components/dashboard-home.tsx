"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AiCvButton } from "@/components/ai-cv-dialog";
import {
  CreateCvButton,
  CreateExampleCvButton,
  CreateFernandoCvButton,
} from "@/components/create-cv-button";
import { DeleteCvButton } from "@/components/delete-cv-button";
import { listLocalCvs, type LocalCv } from "@/lib/cv/local-store";

type CloudCv = {
  id: string;
  title: string;
  updated_at: string;
};

export function DashboardHome({
  signedIn,
  cloudCvs,
  cloudError,
}: {
  signedIn: boolean;
  cloudCvs: CloudCv[];
  cloudError?: string | null;
}) {
  const [localCvs, setLocalCvs] = useState<LocalCv[]>([]);

  useEffect(() => {
    setLocalCvs(listLocalCvs());
  }, []);

  function refreshLocal() {
    setLocalCvs(listLocalCvs());
  }

  const cloudCount = cloudCvs.length;
  const localCount = localCvs.length;
  const total = signedIn ? cloudCount + localCount : localCount;

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            Panel
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">
            Tus currículums
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {total === 0
              ? signedIn
                ? "Crea el primero con IA o desde cero."
                : "Empieza aquí. Se guarda en este navegador hasta que entres con Google."
              : signedIn
                ? `${total} documento${total === 1 ? "" : "s"}.`
                : `${localCount} documento${localCount === 1 ? "" : "s"} en este dispositivo.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <AiCvButton signedIn={signedIn} onLocalCreated={refreshLocal} />
            <CreateCvButton signedIn={signedIn} onLocalCreated={refreshLocal} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <CreateFernandoCvButton
              signedIn={signedIn}
              quiet
              onLocalCreated={refreshLocal}
            />
            <CreateExampleCvButton
              signedIn={signedIn}
              quiet
              onLocalCreated={refreshLocal}
            />
          </div>
        </div>
      </div>

      {!signedIn ? (
        <p className="mt-6 rounded-2xl border border-line bg-cream/80 px-4 py-3 text-sm text-muted">
          Estás en este dispositivo, sin cuenta.{" "}
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Entra con Google
          </Link>{" "}
          si quieres guardar en la nube y no perder el CV al cambiar de
          navegador.
        </p>
      ) : null}

      {cloudError ? (
        <p className="mt-8 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          No se pudieron cargar los CVs de la nube. Ejecuta{" "}
          <code>supabase/schema.sql</code> en el SQL Editor de tu proyecto.{" "}
          {cloudError}
        </p>
      ) : null}

      {total === 0 ? (
        <div className="mt-10 rounded-[1.6rem] border border-dashed border-line bg-cream/80 px-6 py-14 text-center">
          <p className="font-serif text-2xl">Aún no tienes ningún CV</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Empieza con IA, carga un ejemplo o crea uno en blanco.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap">
            <AiCvButton signedIn={signedIn} onLocalCreated={refreshLocal} />
            <CreateFernandoCvButton
              signedIn={signedIn}
              onLocalCreated={refreshLocal}
            />
            <CreateCvButton
              signedIn={signedIn}
              label="Crear mi CV"
              onLocalCreated={refreshLocal}
            />
          </div>
        </div>
      ) : null}

      {signedIn && cloudCount > 0 ? (
        <CvGrid
          heading={localCount > 0 ? "En la nube" : undefined}
          items={cloudCvs}
        />
      ) : null}

      {localCount > 0 ? (
        <CvGrid
          heading={signedIn ? "En este dispositivo" : undefined}
          items={localCvs.map((item) => ({
            id: item.id,
            title: item.title,
            updated_at: item.updated_at,
          }))}
          onLocalDeleted={refreshLocal}
        />
      ) : null}
    </div>
  );
}

function CvGrid({
  heading,
  items,
  onLocalDeleted,
}: {
  heading?: string;
  items: CloudCv[];
  onLocalDeleted?: () => void;
}) {
  return (
    <section className="mt-8">
      {heading ? (
        <h2 className="mb-4 text-xs font-medium tracking-[0.16em] text-muted uppercase">
          {heading}
        </h2>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((cv) => (
          <li
            key={cv.id}
            className="group rounded-[1.4rem] border border-line bg-cream/90 p-5 shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5"
          >
            <Link href={`/cv/${cv.id}`} className="block">
              <p className="text-xs tracking-[0.14em] text-muted uppercase">
                Documento
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight">
                {cv.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                Actualizado {formatDate(cv.updated_at)}
              </p>
            </Link>
            <div className="mt-5 flex items-center justify-between border-t border-line/80 pt-4">
              <Link
                href={`/cv/${cv.id}`}
                className="rounded-full bg-ink px-3.5 py-2 text-sm text-paper transition-colors hover:bg-accent hover:text-on-accent"
              >
                Abrir
              </Link>
              <DeleteCvButton
                id={cv.id}
                title={cv.title}
                onLocalDeleted={onLocalDeleted}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
