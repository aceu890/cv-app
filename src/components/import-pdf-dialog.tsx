"use client";

import { useCallback, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/app-modal";
import { createCvFromAi } from "@/lib/actions/ai-cv";
import { applyAiCvResult } from "@/lib/cv/apply-ai-cv-result";
import { isPdfUpload, MAX_IMPORT_PDF_BYTES } from "@/lib/cv/pdf-import";

export function ImportPdfButton({
  onLocalCreated,
}: {
  onLocalCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover sm:w-auto"
      >
        Subir mi PDF
      </button>
      {open ? (
        <ImportPdfDialog
          onClose={close}
          onLocalCreated={onLocalCreated}
        />
      ) : null}
    </>
  );
}

function ImportPdfDialog({
  onClose,
  onLocalCreated,
}: {
  onClose: () => void;
  onLocalCreated?: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function takeFile(next: File | undefined) {
    if (!next) return;
    if (!isPdfUpload(next)) {
      setError("Sube un archivo PDF.");
      setFile(null);
      return;
    }
    if (next.size > MAX_IMPORT_PDF_BYTES) {
      setError("El PDF pesa demasiado (máximo 6 MB).");
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
  }

  return (
    <AppModal
      labelledBy={titleId}
      canClose={!pending}
      onClose={onClose}
      panelClassName="max-w-lg p-5 sm:p-6"
    >
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          Importar
        </p>
        <h2 id={titleId} className="mt-1 font-serif text-2xl">
          Cargar mi CV en PDF
        </h2>
        <p className="mt-2 text-sm text-muted">
          Sube el PDF que ya tienes. Lo leemos y armamos un currículum editable
          en CV FORGE. No inventamos datos.
        </p>

        <form
          className="mt-5 space-y-4"
          action={async (formData) => {
            if (!file) {
              setError("Elige un PDF primero.");
              return;
            }
            setPending(true);
            setError(null);
            formData.set("file", file);
            try {
              const result = await createCvFromAi(formData);
              const nextError = applyAiCvResult(result, router, onLocalCreated);
              if (nextError) {
                setError(nextError);
                setPending(false);
              }
            } catch {
              setError("No se pudo crear el currículum. Inténtalo de nuevo.");
              setPending(false);
            }
          }}
        >
          <label
            className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center ${
              dragging
                ? "border-accent bg-accent/10"
                : "border-line bg-cream/80"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              takeFile(event.dataTransfer.files?.[0]);
            }}
          >
            <span className="text-sm font-medium">
              {file?.name || "Arrastra el PDF o haz clic para elegirlo"}
            </span>
            <span className="mt-1 text-xs text-muted">PDF, máximo 6 MB</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={pending}
              onChange={(event) => {
                takeFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="min-h-11 rounded-full px-4 text-sm text-muted hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || !file}
              className="min-h-11 rounded-full bg-solid px-5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? "Leyendo el PDF…" : "Crear CV desde el PDF"}
            </button>
          </div>
        </form>
    </AppModal>
  );
}
