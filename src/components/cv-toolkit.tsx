"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CoverLetterSheet } from "@/components/cover-letter-sheet";
import {
  atsReviewAction,
  coverLetterAction,
  interviewKitAction,
  publishCvAction,
  tailorCvAction,
} from "@/lib/actions/cv-tools";
import { createLocalCv } from "@/lib/cv/local-store";
import { exportElementToPdf } from "@/lib/cv/pdf";
import { IconLetter } from "@/components/icons";
import { SectionHead } from "@/components/section-head";
import {
  CV_REGIONS,
  CV_TONES,
  JOB_SOURCES,
  getMeta,
  withMeta,
  type CvData,
  type CvRegion,
  type CvTone,
  type JobSource,
} from "@/lib/cv/schema";

const TABS = [
  { id: "aviso", label: "Aviso", hint: "Pega un trabajo y crea una versión del CV para ese aviso." },
  { id: "carta", label: "Carta", hint: "Redacta una carta de una página con el mismo tono." },
  { id: "ats", label: "ATS", hint: "Puntaje para filtros automáticos y para un reclutador." },
  { id: "entrevista", label: "Entrevista", hint: "Preguntas probables con respuestas en viñetas." },
  { id: "link", label: "Link / QR", hint: "Publica un enlace y un QR para compartir el CV." },
  { id: "formato", label: "LATAM", hint: "País, tono y RUT. Ajusta el CV a tu mercado." },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CvToolkit({
  cvId,
  title,
  data,
  onChange,
}: {
  cvId: string;
  title: string;
  data: CvData;
  onChange: (data: CvData) => void;
}) {
  const router = useRouter();
  const meta = getMeta(data);
  const [tab, setTab] = useState<TabId>("aviso");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState(meta.targetJob?.title ?? "");
  const [company, setCompany] = useState(meta.targetJob?.company ?? "");
  const [source, setSource] = useState<JobSource>(
    meta.targetJob?.source ?? "linkedin",
  );
  const [posting, setPosting] = useState(meta.targetJob?.posting ?? "");
  const [recipient, setRecipient] = useState(meta.coverLetter?.recipient ?? "");
  const [copied, setCopied] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  async function run<T>(label: string, work: () => Promise<T>) {
    setBusy(label);
    setError(null);
    try {
      return await work();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo completar.",
      );
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function tailor() {
    const result = await run("aviso", () =>
      tailorCvAction({
        data,
        title,
        cvId,
        jobTitle,
        company,
        source,
        posting,
      }),
    );
    if (!result) return;
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("local" in result && result.local) {
      const cv = createLocalCv(result.title, result.data);
      router.push(`/cv/${cv.id}`);
      return;
    }
    if ("id" in result && result.id) {
      router.push(`/cv/${result.id}`);
    }
  }

  async function letter() {
    const result = await run("carta", () =>
      coverLetterAction({
        data,
        jobTitle: jobTitle || meta.targetJob?.title || data.personal.title,
        company: company || meta.targetJob?.company || "",
        recipient,
      }),
    );
    if (!result) return;
    if (result.letter) {
      onChange(withMeta(data, { coverLetter: result.letter }));
    }
  }

  async function ats() {
    const result = await run("ats", () =>
      atsReviewAction({ data, posting: posting || meta.targetJob?.posting || "" }),
    );
    if (!result) return;
    if (result.report) {
      onChange(withMeta(data, { atsReport: result.report }));
    }
  }

  async function interview() {
    const result = await run("entrevista", () =>
      interviewKitAction({ data }),
    );
    if (!result) return;
    if (result.kit) {
      onChange(withMeta(data, { interviewKit: result.kit }));
    }
  }

  async function publish() {
    const result = await run("link", () =>
      publishCvAction({
        title,
        data,
        slug: meta.publicSlug,
      }),
    );
    if (!result) return;
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if (result.slug) {
      onChange(withMeta(data, { publicSlug: result.slug }));
    }
  }

  const shareUrl =
    typeof window !== "undefined" && meta.publicSlug
      ? `${window.location.origin}/u/${meta.publicSlug}`
      : "";

  return (
    <section className="relative rounded-[1.4rem] border border-line bg-cream/90 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionHead
          title="Kit de postulación"
          hint="Herramientas para un aviso concreto: adaptar el CV, carta, puntaje ATS, entrevista y link público."
          icon={<IconLetter className="size-5" />}
        />
        {meta.parentTitle ? (
          <p className="text-xs text-muted">Versión de {meta.parentTitle}</p>
        ) : null}
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === item.id
                ? "bg-solid text-on-solid"
                : "text-muted hover:bg-field hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">
        {TABS.find((item) => item.id === tab)?.hint}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "aviso" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Pega el aviso. Creamos una versión nueva: reordena logros y skills,
            no pisa tu CV maestro.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-muted uppercase">
                Puesto
              </span>
              <input
                className="field"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Desarrollador Full-Stack"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted uppercase">
                Empresa
              </span>
              <input
                className="field"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Nimbus Labs"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted uppercase">
              Portal
            </span>
            <select
              className="field"
              value={source}
              onChange={(event) => setSource(event.target.value as JobSource)}
            >
              {JOB_SOURCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted uppercase">
              Texto del aviso
            </span>
            <textarea
              className="field min-h-36 resize-y text-sm"
              value={posting}
              onChange={(event) => setPosting(event.target.value)}
              placeholder="Pega aquí el aviso de LinkedIn, Computrabajo o Get on Board."
            />
          </label>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void tailor()}
            className="rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "aviso" ? "Adaptando…" : "Crear versión para este aviso"}
          </button>
        </div>
      ) : null}

      {tab === "carta" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Misma voz que el CV. Una página, lista para PDF.
          </p>
          <label className="block">
            <span className="mb-1 block text-xs text-muted uppercase">
              Destinatario (opcional)
            </span>
            <input
              className="field"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="Equipo de People"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void letter()}
              className="rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
            >
              {busy === "carta" ? "Escribiendo…" : "Redactar carta"}
            </button>
            {meta.coverLetter ? (
              <button
                type="button"
                onClick={async () => {
                  if (!letterRef.current) return;
                  await exportElementToPdf(
                    letterRef.current,
                    `carta-${data.personal.fullName || "presentacion"}.pdf`,
                  );
                }}
                className="rounded-full border border-line px-4 py-2.5 text-sm text-ink hover:bg-field"
              >
                Exportar carta PDF
              </button>
            ) : null}
          </div>
          {meta.coverLetter ? (
            <>
              <textarea
                className="field min-h-48 resize-y text-sm leading-relaxed"
                value={meta.coverLetter.body}
                onChange={(event) =>
                  onChange(
                    withMeta(data, {
                      coverLetter: {
                        ...meta.coverLetter!,
                        body: event.target.value,
                      },
                    }),
                  )
                }
              />
              <div className="pointer-events-none absolute -left-[9999px] top-0">
                <div
                  ref={letterRef}
                  className="cv-sheet"
                  style={{ width: 794, minHeight: 1123 }}
                >
                  <CoverLetterSheet
                    letter={meta.coverLetter}
                    name={data.personal.fullName}
                    email={data.personal.email}
                    phone={data.personal.phone}
                    location={data.personal.location}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {tab === "ats" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Puntaje para filtros automáticos y lectura humana. Completo y
            gratis.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void ats()}
            className="rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "ats" ? "Revisando…" : "Revisar ATS y reclutador"}
          </button>
          {meta.atsReport ? (
            <div className="space-y-3">
              <p className="font-serif text-4xl tabular-nums">
                {meta.atsReport.score}
                <span className="ml-1 text-base text-muted">/ 100</span>
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${meta.atsReport.score}%` }}
                />
              </div>
              <NoteList title="Filtro ATS" items={meta.atsReport.atsNotes} />
              <NoteList
                title="En 7 segundos"
                items={meta.atsReport.recruiterNotes}
              />
              {meta.atsReport.missingKeywords.length ? (
                <p className="text-sm text-muted">
                  Palabras del aviso que no aparecen:{" "}
                  {meta.atsReport.missingKeywords.join(", ")}
                </p>
              ) : null}
              <ul className="space-y-2">
                {meta.atsReport.issues.map((issue) => (
                  <li
                    key={issue.title}
                    className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {issue.severity === "high"
                        ? "Urgente · "
                        : issue.severity === "medium"
                          ? "Mejora · "
                          : "Detalle · "}
                      {issue.title}
                    </p>
                    <p className="mt-0.5 text-muted">{issue.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "entrevista" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Ocho preguntas probables, con viñetas sacadas de tu CV.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void interview()}
            className="rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "entrevista" ? "Armando kit…" : "Armar kit de entrevista"}
          </button>
          {meta.interviewKit?.items.length ? (
            <ol className="space-y-3">
              {meta.interviewKit.items.map((item, index) => (
                <li
                  key={`${item.question}-${index}`}
                  className="rounded-xl border border-line bg-paper px-3 py-3"
                >
                  <p className="font-medium">
                    {index + 1}. {item.question}
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                    {item.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {tab === "link" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Link público y QR para el PDF o la tarjeta. Quien lo abra ve la
            versión viva.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void publish()}
            className="rounded-full bg-solid px-4 py-2.5 text-sm font-medium text-on-solid hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "link"
              ? "Publicando…"
              : meta.publicSlug
                ? "Actualizar link público"
                : "Publicar link y QR"}
          </button>
          {shareUrl ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                alt="QR del currículum"
                width={180}
                height={180}
                className="rounded-xl border border-line bg-white p-2"
              />
              <div className="min-w-0">
                <p className="break-all text-sm text-ink">{shareUrl}</p>
                <button
                  type="button"
                  className="mt-2 text-sm text-accent hover:underline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? "Copiado" : "Copiar enlace"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "formato" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Ajustes de hoja de vida: país, tono y RUT opcional. La foto es un
            consejo, no se imprime en las plantillas ATS.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-muted uppercase">
                Mercado
              </span>
              <select
                className="field"
                value={meta.region}
                onChange={(event) =>
                  onChange(
                    withMeta(data, {
                      region: event.target.value as CvRegion,
                    }),
                  )
                }
              >
                {CV_REGIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted uppercase">
                Tono
              </span>
              <select
                className="field"
                value={meta.tone}
                onChange={(event) =>
                  onChange(
                    withMeta(data, { tone: event.target.value as CvTone }),
                  )
                }
              >
                {CV_TONES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-muted uppercase">
              RUT (opcional, Chile)
            </span>
            <input
              className="field"
              value={meta.rut}
              onChange={(event) =>
                onChange(withMeta(data, { rut: event.target.value }))
              }
              placeholder="12.345.678-9"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={meta.includePhoto}
              onChange={(event) =>
                onChange(
                  withMeta(data, { includePhoto: event.target.checked }),
                )
              }
            />
            El aviso pide foto (el ATS te dirá si conviene)
          </label>
        </div>
      ) : null}
    </section>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {title}
      </p>
      <ul className="mt-1 list-disc pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
