"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function AppModal({
  labelledBy,
  canClose = true,
  panelClassName,
  children,
  onClose,
}: {
  labelledBy: string;
  canClose?: boolean;
  panelClassName?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const previousOverflow = document.body.style.overflow;
    document.body.dataset.dialog = "open";
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && canClose) onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.dialog;
      window.removeEventListener("keydown", onKey);
    };
  }, [canClose, onClose]);

  if (!ready) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] isolate flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/50"
        onClick={() => {
          if (canClose) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative z-10 w-full rounded-2xl border border-line bg-paper shadow-[0_24px_80px_-32px_rgba(22,20,17,0.55)] ${panelClassName ?? ""}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
