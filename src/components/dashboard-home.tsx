"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AiCvButton } from "@/components/ai-cv-dialog";
import {
  CreateCvButton,
  CreateDepthCards,
  StartFromExtras,
} from "@/components/create-cv-button";
import { CvItemMenu } from "@/components/cv-item-menu";
import { CvScoreBadge } from "@/components/cv-score-badge";
import { IconFile, IconSpark } from "@/components/icons";
import { scoreCv } from "@/lib/cv/score";
import { getMeta, parseCvData } from "@/lib/cv/schema";
import { listLocalCvs, type LocalCv } from "@/lib/cv/local-store";

const VIEW_KEY = "cv-forge-cv-view";
const VIEWS = [
  { id: "cards", label: "Tarjetas" },
  { id: "mosaic", label: "Mosaico" },
  { id: "list", label: "Lista" },
  { id: "compact", label: "Compacta" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

function readView(): ViewId {
  if (typeof window === "undefined") return "cards";
  const stored = window.localStorage.getItem(VIEW_KEY);
  return VIEWS.some((item) => item.id === stored) ? (stored as ViewId) : "cards";
}

type CloudCv = {
  id: string;
  title: string;
  updated_at: string;
  data?: unknown;
  badge?: string;
  score?: number;
};

function cvBadge(title: string, data?: unknown) {
  if (data) {
    const meta = getMeta(parseCvData(data));
    if (meta.targetJob?.title) return `Aviso · ${meta.targetJob.title}`;
    if (meta.publicSlug) return "Link público";
    if (meta.coverLetter) return "Con carta";
  }
  if (title.includes(" · ")) return "Versión para aviso";
  return undefined;
}

export function DashboardHome({
  signedIn,
  cloudCvs,
  cloudError,
}: {
  signedIn: boolean;
  cloudCvs: CloudCv[];
  cloudError?: string | null;
}) {
  const [localCvs, setLocalCvs] = useState<LocalCv[]>([]);
  const [view, setView] = useState<ViewId>("cards");

  useEffect(() => {
    setLocalCvs(listLocalCvs());
    setView(readView());
  }, []);

  function refreshLocal() {
    setLocalCvs(listLocalCvs());
  }

  const cloudCount = cloudCvs.length;
  const localCount = localCvs.length;
  const total = signedIn ? cloudCount + localCount : localCount;

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            Panel
          </p>
          <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl tracking-tight sm:text-4xl">
            <span className="grid size-10 place-items-center rounded-2xl bg-accent/12 text-accent">
              <IconFile className="size-5" />
            </span>
            Tus currículums
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {total === 0
              ? signedIn
                ? "Crea el primero con IA o desde cero."
                : "Empieza aquí. Se guarda en este navegador hasta que entres con Google."
              : signedIn
                ? `${total} documento${total === 1 ? "" : "s"}.`
                : `${localCount} documento${localCount === 1 ? "" : "s"} en este dispositivo.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <AiCvButton signedIn={signedIn} onLocalCreated={refreshLocal} />
        </div>
      </div>

      {!signedIn ? (
        <p className="mt-6 rounded-2xl border border-line bg-cream/80 px-4 py-3 text-sm text-muted">
          Estás en este dispositivo, sin cuenta.{" "}
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Entra con Google
          </Link>{" "}
          si quieres guardar en la nube y no perder el CV al cambiar de
          navegador.
        </p>
      ) : null}

      {cloudError ? (
        <p className="mt-8 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          No se pudieron cargar los CVs de la nube. Ejecuta{" "}
          <code>supabase/schema.sql</code> en el SQL Editor de tu proyecto.{" "}
          {cloudError}
        </p>
      ) : null}

      {total === 0 ? (
        <div className="relative mt-10 overflow-hidden rounded-[1.6rem] border border-dashed border-line bg-cream/80 px-6 py-14 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-accent/12 text-accent">
            <IconSpark className="size-7" />
          </div>
          <p className="font-serif text-2xl">Aún no tienes ningún CV</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Elige un ritmo: rápido, equilibrado o con todas las herramientas.
          </p>
          <div className="mx-auto mt-6 max-w-4xl text-left">
            <CreateDepthCards
              signedIn={signedIn}
              onLocalCreated={refreshLocal}
            />
          </div>
          <div className="mx-auto mt-6 max-w-4xl text-left">
            <StartFromExtras
              signedIn={signedIn}
              onLocalCreated={refreshLocal}
            />
          </div>
          <div className="mt-5 flex justify-center">
            <AiCvButton signedIn={signedIn} onLocalCreated={refreshLocal} />
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.16em] text-muted uppercase">
              Traer lo que ya tienes
            </p>
            <StartFromExtras
              signedIn={signedIn}
              onLocalCreated={refreshLocal}
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.16em] text-muted uppercase">
              O empezar en blanco
            </p>
            <CreateDepthCards
              signedIn={signedIn}
              onLocalCreated={refreshLocal}
            />
          </div>
        </div>
      )}

      {total > 0 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
            Vista
          </p>
          <div className="flex rounded-full border border-line bg-cream p-1">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-pressed={view === item.id}
                onClick={() => {
                  setView(item.id);
                  window.localStorage.setItem(VIEW_KEY, item.id);
                }}
                className={`grid size-9 place-items-center rounded-full ${
                  view === item.id
                    ? "bg-solid text-on-solid"
                    : "text-muted hover:text-ink"
                }`}
              >
                <ViewIcon id={item.id} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {signedIn && cloudCount > 0 ? (
        <CvCollection
          view={view}
          heading={localCount > 0 ? "En la nube" : undefined}
          items={cloudCvs.map((item) => ({
            ...item,
            badge: cvBadge(item.title, item.data),
            score: item.data ? scoreCv(parseCvData(item.data)) : undefined,
          }))}
        />
      ) : null}

      {localCount > 0 ? (
        <CvCollection
          view={view}
          heading={signedIn ? "En este dispositivo" : undefined}
          items={localCvs.map((item) => ({
            id: item.id,
            title: item.title,
            updated_at: item.updated_at,
            badge: cvBadge(item.title, item.data),
            score: scoreCv(item.data),
          }))}
          onLocalDeleted={refreshLocal}
        />
      ) : null}
    </div>
  );
}

function CvCollection({
  view,
  heading,
  items,
  onLocalDeleted,
}: {
  view: ViewId;
  heading?: string;
  items: CloudCv[];
  onLocalDeleted?: () => void;
}) {
  const listClass =
    view === "list"
      ? "divide-y divide-line/80 rounded-[1.4rem] border border-line bg-cream/90"
      : view === "compact"
        ? "overflow-hidden rounded-[1.2rem] border border-line"
        : view === "mosaic"
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "grid gap-4 sm:grid-cols-2";

  return (
    <section className="mt-5">
      {heading ? (
        <h2 className="mb-4 text-xs font-medium tracking-[0.16em] text-muted uppercase">
          {heading}
        </h2>
      ) : null}
      <ul className={listClass}>
        {items.map((cv) => (
          <CvItem
            key={cv.id}
            cv={cv}
            view={view}
            onLocalDeleted={onLocalDeleted}
          />
        ))}
      </ul>
    </section>
  );
}

function CvItem({
  cv,
  view,
  onLocalDeleted,
}: {
  cv: CloudCv;
  view: ViewId;
  onLocalDeleted?: () => void;
}) {
  if (view === "list" || view === "compact") {
    return (
      <li
        className={`flex flex-wrap items-center gap-3 px-4 ${
          view === "compact"
            ? "border-b border-line bg-cream/80 py-2.5 last:border-b-0"
            : "py-4 sm:px-5"
        }`}
      >
        <Link href={`/cv/${cv.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium">{cv.title}</p>
          <p className="text-xs text-muted">
            {cv.badge ?? "Documento"} · {formatDate(cv.updated_at)}
          </p>
        </Link>
        {typeof cv.score === "number" ? (
          <CvScoreBadge score={cv.score} size="sm" />
        ) : null}
        <CvItemMenu
          id={cv.id}
          title={cv.title}
          onLocalDeleted={onLocalDeleted}
        />
      </li>
    );
  }

  return (
    <li
      className={`lift relative overflow-visible border border-line bg-cream/90 shadow-[var(--shadow)] ${
        view === "mosaic"
          ? "rounded-[1.15rem] p-4"
          : "rounded-[1.4rem] p-5"
      }`}
    >
      <div className="absolute top-3 right-3 z-20">
        <CvItemMenu
          id={cv.id}
          title={cv.title}
          onLocalDeleted={onLocalDeleted}
        />
      </div>
      <Link href={`/cv/${cv.id}`} className="block pr-10">
        <p className="text-xs tracking-[0.14em] text-muted uppercase">
          {cv.badge ?? "Documento"}
        </p>
        <h2
          className={`mt-2 font-serif leading-tight ${
            view === "mosaic" ? "text-xl" : "text-2xl"
          }`}
        >
          {cv.title}
        </h2>
        <p className="mt-2 text-sm text-muted">
          Actualizado {formatDate(cv.updated_at)}
        </p>
        {typeof cv.score === "number" ? (
          <div className="mt-3 max-w-[7.5rem]">
            <CvScoreBadge score={cv.score} size="sm" />
          </div>
        ) : null}
      </Link>
    </li>
  );
}

function ViewIcon({ id }: { id: ViewId }) {
  if (id === "cards") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <rect x="3" y="4" width="8" height="16" rx="1.5" fill="currentColor" />
        <rect x="13" y="4" width="8" height="16" rx="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (id === "mosaic") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <rect x="3" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="9.25" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="15.5" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="3" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="9.25" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="15.5" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="3" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="9.25" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
        <rect x="15.5" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
      </svg>
    );
  }

  if (id === "list") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <rect x="3" y="5" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="6" width="12" height="2" rx="1" fill="currentColor" />
        <rect x="3" y="10" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="11" width="12" height="2" rx="1" fill="currentColor" />
        <rect x="3" y="15" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="16" width="12" height="2" rx="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <rect x="3" y="5" width="18" height="1.7" rx="0.8" fill="currentColor" />
      <rect x="3" y="9.1" width="18" height="1.7" rx="0.8" fill="currentColor" />
      <rect x="3" y="13.2" width="18" height="1.7" rx="0.8" fill="currentColor" />
      <rect x="3" y="17.3" width="18" height="1.7" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
