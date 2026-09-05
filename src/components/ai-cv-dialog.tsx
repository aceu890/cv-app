"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppModal } from "@/components/app-modal";
import { createCvFromAi } from "@/lib/actions/ai-cv";
import { applyAiCvResult } from "@/lib/cv/apply-ai-cv-result";
import { isPdfUpload, MAX_IMPORT_PDF_BYTES } from "@/lib/cv/pdf-import";

export function AiCvButton({
  onLocalCreated,
}: {
  signedIn?: boolean;
  onLocalCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid transition-colors hover:bg-accent-hover hover:text-on-accent sm:w-auto"
      >
        Crear con IA
      </button>
      {open ? (
        <AiCvDialog
          onClose={close}
          onLocalCreated={onLocalCreated}
        />
      ) : null}
    </>
  );
}

function AiCvDialog({
  onClose,
  onLocalCreated,
}: {
  onClose: () => void;
  onLocalCreated?: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  return (
    <AppModal
      labelledBy={titleId}
      canClose={!pending}
      onClose={onClose}
      panelClassName="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden"
    >
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            Asistente
          </p>
          <h2 id={titleId} className="mt-1 font-serif text-2xl tracking-tight">
            Crear CV con IA · Dossier
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Pega tu texto, exporta LinkedIn o sube un PDF. Armamos el
            currículum en Dossier. No inventamos cifras.
          </p>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          action={async (formData) => {
            setPending(true);
            setError(null);
            if (file) formData.set("file", file);
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
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <label className="block">
              <span className="text-sm font-medium">Importar PDF o TXT</span>
              <input
                type="file"
                accept=".txt,.md,.pdf,text/plain,application/pdf"
                disabled={pending}
                className="mt-2 block w-full text-sm text-muted"
                onChange={async (event) => {
                  const next = event.target.files?.[0];
                  event.target.value = "";
                  if (!next) return;
                  if (next.size > MAX_IMPORT_PDF_BYTES) {
                    setError("El archivo pesa demasiado (máximo 6 MB).");
                    setFile(null);
                    setFileName("");
                    return;
                  }
                  setError(null);
                  setFileName(next.name);
                  if (isPdfUpload(next)) {
                    setFile(next);
                    return;
                  }
                  const text = await next.text();
                  if (textareaRef.current) {
                    textareaRef.current.value = text;
                  }
                  setFile(null);
                }}
              />
              {fileName ? (
                <span className="mt-1 block text-xs text-muted">{fileName}</span>
              ) : null}
            </label>
            <label htmlFor="ai-cv-context" className="mt-4 block text-sm font-medium">
              O pega LinkedIn / tu CV en texto
            </label>
            <textarea
              ref={textareaRef}
              id="ai-cv-context"
              name="context"
              required={!file}
              minLength={file ? undefined : 40}
              rows={14}
              autoFocus
              disabled={pending}
              placeholder={`Ejemplo:
Fernando Andrés Soto Gazul
Desarrollador Full-Stack
+56 9 8546 7687 · asd-dev@hotmail.com
Valparaíso, Chile
github.com/aceu890

Freelance desde marzo 2024: sitios a medida y landings.
Inbox-Phone 2023–2024: configurador de carcasas y API Spring Boot.
AIEP, Programador Computacional.
React, TypeScript, Node.js, Java, SQL.`}
              className="field mt-2 min-h-64 resize-y font-sans text-sm leading-relaxed"
            />
            {error ? (
              <p className="mt-3 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="min-h-11 rounded-full px-4 text-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-full bg-solid px-5 text-sm font-medium text-on-solid transition-colors hover:bg-accent-hover hover:text-on-accent disabled:opacity-60"
            >
              {pending ? "Creando tu Dossier…" : "Crear currículum"}
            </button>
          </div>
        </form>
    </AppModal>
  );
}
