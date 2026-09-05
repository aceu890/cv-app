"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { deleteCv } from "@/lib/actions/account";
import { deleteLocalCv, isLocalCvId } from "@/lib/cv/local-store";

export function CvItemMenu({
  id,
  title,
  onLocalDeleted,
}: {
  id: string;
  title: string;
  onLocalDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function remove() {
    const confirmed = window.confirm(
      `¿Eliminar “${title}”? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setPending(true);
    if (isLocalCvId(id)) {
      deleteLocalCv(id);
      onLocalDeleted?.();
      setPending(false);
      setOpen(false);
      return;
    }

    const formData = new FormData();
    formData.set("id", id);
    await deleteCv(formData);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Opciones de ${title}`}
        title="Opciones"
        onClick={() => setOpen((current) => !current)}
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-field hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="12" cy="5" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-10 right-0 z-30 min-w-44 rounded-xl border border-line bg-paper py-1 shadow-[var(--shadow)]"
        >
          <Link
            role="menuitem"
            href={`/cv/${id}`}
            className="block px-3.5 py-2.5 text-sm text-ink hover:bg-cream"
            onClick={() => setOpen(false)}
          >
            Abrir
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={() => void remove()}
            className="block w-full px-3.5 py-2.5 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
