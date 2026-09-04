"use client";

import { useState } from "react";
import { deleteCv } from "@/lib/actions/account";
import { deleteLocalCv, isLocalCvId } from "@/lib/cv/local-store";

export function DeleteCvButton({
  id,
  title,
  onLocalDeleted,
}: {
  id: string;
  title: string;
  onLocalDeleted?: () => void;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        const confirmed = window.confirm(
          `¿Eliminar “${title}”? Esta acción no se puede deshacer.`,
        );
        if (!confirmed) return;
        setPending(true);
        if (isLocalCvId(id)) {
          deleteLocalCv(id);
          onLocalDeleted?.();
          setPending(false);
          return;
        }
        await deleteCv(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 text-sm text-muted transition-colors hover:text-danger disabled:opacity-60"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
    </form>
  );
}
