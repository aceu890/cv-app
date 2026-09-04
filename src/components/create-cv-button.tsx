import { createCv, createExampleCv, createFernandoCv } from "@/lib/actions/account";

export function CreateCvButton({ label = "Nuevo currículum" }: { label?: string }) {
  return (
    <form action={createCv}>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-field px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream sm:w-auto"
      >
        {label}
      </button>
    </form>
  );
}

export function CreateFernandoCvButton() {
  return (
    <form action={createFernandoCv}>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover sm:w-auto"
      >
        Cargar mi CV profesional
      </button>
    </form>
  );
}

export function CreateExampleCvButton() {
  return (
    <form action={createExampleCv}>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-field px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream sm:w-auto"
      >
        CV de ejemplo (Full-Stack)
      </button>
    </form>
  );
}
