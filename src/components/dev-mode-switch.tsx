"use client";

import { DEV_ORIGIN } from "@/lib/dev-mode";
import { useDevMode } from "@/lib/use-dev-mode";

export function DevModeSwitch() {
  const { on, toggle } = useDevMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      title={
        on
          ? `Modo desarrollo: Google vuelve a ${DEV_ORIGIN}`
          : "Modo producción: Google vuelve a cv-forgex.netlify.app"
      }
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-2.5 text-xs font-medium transition-colors ${
        on
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-line bg-cream/70 text-muted"
      }`}
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-accent" : "bg-line"
        }`}
      >
        <span
          className={`size-4 rounded-full bg-paper shadow-sm transition-transform ${
            on ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      <span>{on ? "Dev" : "Prod"}</span>
    </button>
  );
}
