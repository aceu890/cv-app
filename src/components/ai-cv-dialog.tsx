"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createCvFromAi } from "@/lib/actions/ai-cv";
import { createLocalCv } from "@/lib/cv/local-store";

export function AiCvButton({
  onLocalCreated,
}: {
  signedIn?: boolean;
  onLocalCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent hover:text-on-accent sm:w-auto"
      >
        Crear con IA
      </button>
      {open ? (
        <AiCvDialog
          onClose={() => setOpen(false)}
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

  useEffect(() => {
    textareaRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, pending]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/40"
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_80px_-32px_rgba(28,25,21,0.55)]"
      >
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            Asistente
          </p>
          <h2 id={titleId} className="mt-1 font-serif text-2xl tracking-tight">
            Crear CV con IA · Dossier
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Cuéntale quién eres: oficio, empresas, fechas, estudios, skills y
            contacto. Armamos el currículum en plantilla Dossier. No inventamos
            cifras.
          </p>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          action={async (formData) => {
            setPending(true);
            setError(null);
            const result = await createCvFromAi(formData);
            if (result?.error) {
              setError(result.error);
              setPending(false);
              return;
            }
            if (result?.local) {
              const cv = createLocalCv(result.title, result.data);
              onLocalCreated?.();
              router.push(`/cv/${cv.id}`);
            }
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <label htmlFor="ai-cv-context" className="text-sm font-medium">
              Tu contexto
            </label>
            <textarea
              ref={textareaRef}
              id="ai-cv-context"
              name="context"
              required
              minLength={40}
              rows={14}
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
              className="min-h-11 rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-accent hover:text-on-accent disabled:opacity-60"
            >
              {pending ? "Creando tu Dossier…" : "Crear currículum"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
