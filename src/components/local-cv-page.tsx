"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CvEditor } from "@/components/cv-editor";
import { getLocalCv, type LocalCv } from "@/lib/cv/local-store";

export function LocalCvPage({ id }: { id: string }) {
  const [cv, setCv] = useState<LocalCv | null | undefined>(undefined);

  useEffect(() => {
    setCv(getLocalCv(id));
  }, [id]);

  if (cv === undefined) {
    return <p className="text-sm text-muted">Cargando currículum…</p>;
  }

  if (!cv) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-line bg-cream/80 px-6 py-14 text-center">
        <p className="font-serif text-2xl">Este CV no está en este navegador</p>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Los documentos sin cuenta viven en el dispositivo donde los creaste.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-solid px-4 py-2.5 text-sm text-on-solid"
        >
          Volver a tus CVs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream/80 px-3 text-sm text-muted transition-colors hover:text-ink"
      >
        ← Tus CVs
      </Link>
      <div className="mt-5">
        <CvEditor
          cvId={cv.id}
          initialTitle={cv.title}
          initialData={cv.data}
        />
      </div>
    </div>
  );
}
