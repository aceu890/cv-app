"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCv,
  createExampleCv,
  createFernandoCv,
} from "@/lib/actions/account";
import { EXAMPLE_CV_TITLE, createFullStackExampleCv } from "@/lib/cv/example";
import { FERNANDO_CV_TITLE, createFernandoCvData } from "@/lib/cv/fernando";
import { createLocalCv, listLocalCvs } from "@/lib/cv/local-store";
import { createDefaultCvData } from "@/lib/cv/schema";

type LocalAwareProps = {
  signedIn?: boolean;
  onLocalCreated?: () => void;
};

export function CreateCvButton({
  label = "Nuevo currículum",
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps & { label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (signedIn) {
    return (
      <form action={createCv}>
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
          createDefaultCvData(),
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

export function CreateFernandoCvButton({
  quiet = false,
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps & { quiet?: boolean }) {
  const router = useRouter();
  const className = quiet
    ? "min-h-9 text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
    : "inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover sm:w-auto";

  if (signedIn) {
    return (
      <form action={createFernandoCv}>
        <button type="submit" className={className}>
          Cargar mi CV profesional
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
          (item) => item.title === FERNANDO_CV_TITLE,
        );
        const cv = existing
          ? existing
          : createLocalCv(FERNANDO_CV_TITLE, createFernandoCvData());
        onLocalCreated?.();
        router.push(`/cv/${cv.id}`);
      }}
    >
      Cargar mi CV profesional
    </button>
  );
}

export function CreateExampleCvButton({
  quiet = false,
  signedIn = false,
  onLocalCreated,
}: LocalAwareProps & { quiet?: boolean }) {
  const router = useRouter();
  const className = quiet
    ? "min-h-9 text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
    : "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-cream px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-field sm:w-auto";

  if (signedIn) {
    return (
      <form action={createExampleCv}>
        <button type="submit" className={className}>
          CV de ejemplo
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
      CV de ejemplo
    </button>
  );
}
