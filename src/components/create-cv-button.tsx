"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCv,
  createExampleCv,
} from "@/lib/actions/account";
import { EXAMPLE_CV_TITLE, createFullStackExampleCv } from "@/lib/cv/example";
import { createLocalCv, listLocalCvs } from "@/lib/cv/local-store";
import {
  CV_DEPTHS,
  createDefaultCvData,
  type CvDepth,
} from "@/lib/cv/schema";
import { ImportPdfButton } from "@/components/import-pdf-dialog";
import { IconFile, IconSpark } from "@/components/icons";

type LocalAwareProps = {
  signedIn?: boolean;
  onLocalCreated?: () => void;
};

export function CreateCvButton({
  label = "Nuevo currículum",
  signedIn = false,
  onLocalCreated,
  depth = "medio",
}: LocalAwareProps & { label?: string; depth?: CvDepth }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (signedIn) {
    return (
      <form action={createCv}>
        <input type="hidden" name="depth" value={depth} />
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-cream px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-field sm:w-auto"
        >
          {label}
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        const count = listLocalCvs().length;
        const cv = createLocalCv(
          count > 0 ? `Mi CV ${count + 1}` : "Mi CV",
          createDefaultCvData(undefined, depth),
        );
        onLocalCreated?.();
        router.push(`/cv/${cv.id}`);
      }}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-cream px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-field disabled:opacity-60 sm:w-auto"
    >
      {label}
    </button>
  );
}

export function CreateDepthCards({
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CV_DEPTHS.map((item) => (
        <div
          key={item.id}
          className="lift rounded-[1.2rem] border border-line bg-cream/90 p-4"
        >
          <p className="text-xs tracking-[0.14em] text-accent uppercase">
            {item.id === "basico"
              ? "Rápido"
              : item.id === "medio"
                ? "Equilibrio"
                : "Completo"}
          </p>
          <h3 className="mt-1 font-serif text-xl">{item.label}</h3>
          <p className="mt-1 text-sm text-muted">
            {item.id === "basico"
              ? "Nombre, contacto, un trabajo y estudios. Para quien quiere salir hoy."
              : item.id === "medio"
                ? "CV redondo: links, proyectos e idiomas, sin saturar."
                : "Todo el kit: aviso, carta, ATS, QR y campos extra."}
          </p>
          <div className="mt-4">
            <CreateCvButton
              signedIn={signedIn}
              onLocalCreated={onLocalCreated}
              depth={item.id}
              label={`Empezar ${item.label.toLowerCase()}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CreateExampleCvButton({
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps) {
  const router = useRouter();
  const className =
    "inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover sm:w-auto";

  if (signedIn) {
    return (
      <form action={createExampleCv}>
        <button type="submit" className={className}>
          Abrir ejemplo
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const existing = listLocalCvs().find(
          (item) => item.title === EXAMPLE_CV_TITLE,
        );
        const cv =
          existing ??
          createLocalCv(EXAMPLE_CV_TITLE, createFullStackExampleCv());
        onLocalCreated?.();
        router.push(`/cv/${cv.id}`);
      }}
    >
      Abrir ejemplo
    </button>
  );
}

export function StartFromExtras({
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="lift rounded-[1.3rem] border border-line bg-paper p-4 sm:p-5">
        <span className="grid size-10 place-items-center rounded-2xl bg-solid text-on-solid">
          <IconFile className="size-5" />
        </span>
        <h3 className="mt-3 font-serif text-xl">Cargar mi CV</h3>
        <p className="mt-1 text-sm text-muted">
          Sube el PDF que ya tienes y lo convertimos en un CV editable.
        </p>
        <div className="mt-4">
          <ImportPdfButton onLocalCreated={onLocalCreated} />
        </div>
      </article>
      <article className="lift rounded-[1.3rem] border border-line bg-paper p-4 sm:p-5">
        <span className="grid size-10 place-items-center rounded-2xl bg-accent/15 text-accent">
          <IconSpark className="size-5" />
        </span>
        <h3 className="mt-3 font-serif text-xl">CV de ejemplo</h3>
        <p className="mt-1 text-sm text-muted">
          Mira un currículum ya armado y úsalo de guía o punto de partida.
        </p>
        <div className="mt-4">
          <CreateExampleCvButton
            signedIn={signedIn}
            onLocalCreated={onLocalCreated}
          />
        </div>
      </article>
    </div>
  );
}
