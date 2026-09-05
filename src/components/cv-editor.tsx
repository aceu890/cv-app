"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CvPreview } from "@/components/cv-preview";
import { CvScoreBadge } from "@/components/cv-score-badge";
import { CvToolkit } from "@/components/cv-toolkit";
import { DatePicker } from "@/components/date-picker";
import {
  IconAward,
  IconBriefcase,
  IconSchool,
  IconTags,
  IconUser,
} from "@/components/icons";
import { SectionHead } from "@/components/section-head";
import { TemplatePicker } from "@/components/template-picker";
import { scoreCv } from "@/lib/cv/score";
import { cvFileName, exportElementToPdf } from "@/lib/cv/pdf";
import {
  CV_DEPTHS,
  cvDataToJson,
  getMeta,
  type CvDepth,
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyLanguage,
  emptyProject,
  LANGUAGE_LEVELS,
  type CvData,
  type CvEducation,
  type CvExperience,
  type CvProject,
} from "@/lib/cv/schema";
import { isLocalCvId, saveLocalCv } from "@/lib/cv/local-store";
import type { CvTemplateId } from "@/lib/cv/templates";
import { createClient } from "@/lib/supabase/client";

type SaveState = "idle" | "saving" | "saved" | "error";

type CvEditorProps = {
  cvId: string;
  initialTitle: string;
  initialData: CvData;
};

export function CvEditor({ cvId, initialTitle, initialData }: CvEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<CvData>(initialData);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [savedData, setSavedData] = useState(initialData);
  const [status, setStatus] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "working" | "error">(
    "idle",
  );
  const sheetRef = useRef<HTMLDivElement>(null);

  const dirty =
    title !== savedTitle || JSON.stringify(data) !== JSON.stringify(savedData);

  async function handleSave() {
    await saveCv(cvId, title, data, setStatus, setError, () => {
      setSavedTitle(title.trim() || "Mi CV");
      setSavedData(data);
    });
  }

  function updatePersonal<K extends keyof CvData["personal"]>(
    key: K,
    value: CvData["personal"][K],
  ) {
    setData((current) => ({
      ...current,
      personal: { ...current.personal, [key]: value },
    }));
  }

  function patchExperience(index: number, patch: Partial<CvExperience>) {
    setData((current) => {
      const experience = [...current.experience];
      experience[index] = { ...experience[index], ...patch };
      return { ...current, experience };
    });
  }

  function patchEducation(index: number, patch: Partial<CvEducation>) {
    setData((current) => {
      const education = [...current.education];
      education[index] = { ...education[index], ...patch };
      return { ...current, education };
    });
  }

  function patchProject(index: number, patch: Partial<CvProject>) {
    setData((current) => {
      const projects = [...current.projects];
      projects[index] = { ...projects[index], ...patch };
      return { ...current, projects };
    });
  }

  async function handleExportPdf() {
    setPane("preview");
    setPdfStatus("working");

    let sheet: HTMLDivElement | null = null;
    for (let attempt = 0; attempt < 25; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      sheet = sheetRef.current;
      if (sheet && sheet.scrollHeight > 80) break;
    }

    if (!sheet) {
      setPdfStatus("error");
      return;
    }

    try {
      await exportElementToPdf(
        sheet,
        cvFileName(title, data.personal.fullName),
      );
      setPdfStatus("idle");
    } catch {
      setPdfStatus("error");
    }
  }

  const local = isLocalCvId(cvId);
  const meta = getMeta(data);
  const depth = meta.depth;
  const score = scoreCv(data);
  const showMedio = depth !== "basico";
  const showPro = depth === "pro";

  function setDepth(next: CvDepth) {
    setData((current) => ({
      ...current,
      meta: { ...getMeta(current), depth: next },
    }));
  }

  return (
    <div className="space-y-6 pb-28 lg:space-y-8 lg:pb-8">
      {local ? (
        <p className="rounded-2xl border border-line bg-cream/80 px-4 py-3 text-sm text-muted">
          Este CV se guarda en este navegador.{" "}
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Entra con Google
          </Link>{" "}
          para copiarlo a la nube y no perderlo.
        </p>
      ) : null}
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-paper/90 px-4 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-2 rounded-full bg-cream p-1">
          <button
            type="button"
            onClick={() => setPane("edit")}
            className={`rounded-full px-3 py-2.5 text-sm font-medium ${
              pane === "edit" ? "bg-solid text-on-solid" : "text-muted"
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setPane("preview")}
            className={`rounded-full px-3 py-2.5 text-sm font-medium ${
              pane === "preview" ? "bg-solid text-on-solid" : "text-muted"
            }`}
          >
            Vista previa
          </button>
        </div>
      </div>

      <div className={pane === "edit" ? "block space-y-6" : "hidden lg:block"}>
        <TemplatePicker
          value={data.template}
          onChange={(template: CvTemplateId) =>
            setData((current) => ({ ...current, template }))
          }
        />
        {showPro ? (
          <CvToolkit
            cvId={cvId}
            title={title}
            data={data}
            onChange={setData}
          />
        ) : null}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]">
      <div className={`space-y-8 ${pane === "edit" ? "block" : "hidden lg:block"}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
              Nombre del documento
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
            />
          </label>
          <CvScoreBadge score={score} />
          <SaveBadge
            status={status}
            error={error}
            dirty={dirty}
            pdfStatus={pdfStatus}
            className="hidden sm:block"
          />
        </div>

        <div className="rounded-2xl border border-line bg-cream/80 p-3">
          <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">
            Cómo quieres armarlo
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {CV_DEPTHS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDepth(item.id)}
                className={`rounded-xl border px-3 py-2 text-left ${
                  depth === item.id
                    ? "border-accent bg-paper"
                    : "border-line bg-field hover:border-ink/20"
                }`}
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted">{item.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-4">
          <SectionHead
            title="Encabezado"
            hint="Tus datos de contacto. Es lo primero que lee el reclutador."
            icon={<IconUser className="size-5" />}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nombre completo"
              value={data.personal.fullName}
              onChange={(value) => updatePersonal("fullName", value)}
            />
            <Field
              label="Titular profesional"
              value={data.personal.title}
              onChange={(value) => updatePersonal("title", value)}
              placeholder="Desarrollador Full-Stack"
            />
            <Field
              label="Email"
              value={data.personal.email}
              onChange={(value) => updatePersonal("email", value)}
            />
            <Field
              label="Teléfono"
              value={data.personal.phone}
              onChange={(value) => updatePersonal("phone", value)}
            />
            <Field
              label="Ciudad"
              value={data.personal.location}
              onChange={(value) => updatePersonal("location", value)}
              placeholder="Santiago, Chile"
            />
            {showMedio ? (
              <Field
                label="LinkedIn"
                value={data.personal.linkedin}
                onChange={(value) => updatePersonal("linkedin", value)}
                placeholder="linkedin.com/in/usuario"
              />
            ) : null}
            {showMedio ? (
              <Field
                label="GitHub / Portafolio"
                value={data.personal.website}
                onChange={(value) => updatePersonal("website", value)}
                placeholder="github.com/usuario"
              />
            ) : null}
            {showPro ? (
              <Field
                label="RUT (opcional)"
                value={meta.rut}
                onChange={(value) =>
                  setData((current) => ({
                    ...current,
                    meta: { ...getMeta(current), rut: value },
                  }))
                }
                placeholder="12.345.678-9"
              />
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHead
            title="Perfil profesional"
            hint="3 o 4 líneas: quién eres, qué haces y qué buscas."
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
              3–4 líneas sobre quién eres y qué aportas
            </span>
            <textarea
              rows={4}
              value={data.personal.summary}
              onChange={(event) =>
                updatePersonal("summary", event.target.value)
              }
              className="field min-h-28 resize-y"
              placeholder="Informático con experiencia en desarrollo web, soporte TI y procesos administrativos. Busco aportar en empresas industriales o portuarias."
            />
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Experiencia profesional"
              hint="Puestos recientes primero. Cada viñeta: verbo + qué hiciste + resultado."
              icon={<IconBriefcase className="size-5" />}
            />
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  experience: [...current.experience, emptyExperience()],
                }))
              }
            >
              Añadir
            </button>
          </div>
          {data.experience.length === 0 ? (
            <p className="text-sm text-muted">
              Añade puestos en orden inverso: el más reciente primero.
            </p>
          ) : (
            <div className="space-y-6">
              {data.experience.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-line bg-cream p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Empresa"
                      value={item.company}
                      onChange={(value) => patchExperience(index, { company: value })}
                    />
                    <Field
                      label="Puesto"
                      value={item.role}
                      onChange={(value) => patchExperience(index, { role: value })}
                    />
                    <Field
                      label="Ciudad"
                      value={item.location}
                      onChange={(value) =>
                        patchExperience(index, { location: value })
                      }
                      placeholder="Santiago, Chile"
                    />
                    <DatePicker
                      label="Inicio"
                      value={item.startDate}
                      onChange={(value) =>
                        patchExperience(index, { startDate: value })
                      }
                    />
                    <DatePicker
                      label="Fin"
                      value={item.endDate}
                      disabled={item.current}
                      onChange={(value) =>
                        patchExperience(index, { endDate: value })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.current}
                      onChange={(event) =>
                        patchExperience(index, {
                          current: event.target.checked,
                        })
                      }
                    />
                    Trabajo actual
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
                      Logros en viñetas
                    </span>
                    <p className="mb-2 text-xs text-muted">
                      Un logro por línea. Prioriza resultados cuantificables,
                      herramientas y mejoras.
                    </p>
                    <BulletEditor
                      values={item.highlights.length > 0 ? item.highlights : [""]}
                      onChange={(highlights) =>
                        patchExperience(index, { highlights })
                      }
                      placeholder="Logro cuantificable, tecnología usada o mejora realizada"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-muted hover:text-danger"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        experience: current.experience.filter(
                          (row) => row.id !== item.id,
                        ),
                      }))
                    }
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Educación"
              hint="Título, instituto y años. Lo más reciente arriba."
              icon={<IconSchool className="size-5" />}
            />
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  education: [...current.education, emptyEducation()],
                }))
              }
            >
              Añadir
            </button>
          </div>
          {data.education.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay educación.</p>
          ) : (
            <div className="space-y-6">
              {data.education.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-line bg-cream p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Institución"
                      value={item.school}
                      onChange={(value) => patchEducation(index, { school: value })}
                    />
                    <Field
                      label="Título"
                      value={item.degree}
                      onChange={(value) => patchEducation(index, { degree: value })}
                    />
                    <Field
                      label="Ciudad"
                      value={item.location}
                      onChange={(value) =>
                        patchEducation(index, { location: value })
                      }
                    />
                    <Field
                      label="Honores, GPA o nota"
                      value={item.details}
                      onChange={(value) =>
                        patchEducation(index, { details: value })
                      }
                    />
                    <DatePicker
                      label="Inicio"
                      value={item.startDate}
                      onChange={(value) =>
                        patchEducation(index, { startDate: value })
                      }
                    />
                    <DatePicker
                      label="Fin"
                      value={item.endDate}
                      onChange={(value) =>
                        patchEducation(index, { endDate: value })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-muted hover:text-danger"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        education: current.education.filter(
                          (row) => row.id !== item.id,
                        ),
                      }))
                    }
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Habilidades"
              hint="Herramientas y oficios que sí usas. 6 a 12 es un buen número."
              icon={<IconTags className="size-5" />}
            />
          </div>
          <BulletEditor
            values={data.skills.length > 0 ? data.skills : [""]}
            onChange={(skills) =>
              setData((current) => ({
                ...current,
                skills,
              }))
            }
            placeholder="Excel, HTML/CSS/JavaScript, Flutter, bases de datos…"
          />
        </section>

        {showMedio ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Proyectos"
              hint="Trabajos propios o de estudio que muestren cómo haces las cosas."
            />
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  projects: [...current.projects, emptyProject()],
                }))
              }
            >
              Añadir
            </button>
          </div>
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted">
              Opcional: un proyecto con descripción, tecnologías y resultado.
            </p>
          ) : (
            <div className="space-y-6">
              {data.projects.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-xl border border-line bg-cream p-4">
                  <Field
                    label="Nombre del proyecto"
                    value={item.name}
                    onChange={(value) => patchProject(index, { name: value })}
                  />
                  <Field
                    label="Descripción"
                    value={item.description}
                    onChange={(value) =>
                      patchProject(index, { description: value })
                    }
                    placeholder="Qué hiciste en el proyecto"
                  />
                  <Field
                    label="Tecnologías"
                    value={item.technologies}
                    onChange={(value) =>
                      patchProject(index, { technologies: value })
                    }
                    placeholder="Flutter, Firebase, PostgreSQL"
                  />
                  <Field
                    label="Resultado"
                    value={item.result}
                    onChange={(value) => patchProject(index, { result: value })}
                    placeholder="Qué se logró"
                  />
                  <button
                    type="button"
                    className="text-sm text-muted hover:text-danger"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        projects: current.projects.filter(
                          (row) => row.id !== item.id,
                        ),
                      }))
                    }
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        ) : null}

        {showPro ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Cursos y certificados"
              hint="Solo los que suman al puesto. Nombre, quién lo dio y año."
              icon={<IconAward className="size-5" />}
            />
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  certifications: [
                    ...current.certifications,
                    emptyCertification(),
                  ],
                }))
              }
            >
              Añadir
            </button>
          </div>
          {data.certifications.length === 0 ? (
            <p className="text-sm text-muted">Opcional: cursos o certificados.</p>
          ) : (
            <div className="space-y-4">
              {data.certifications.map((item, index) => (
                <div key={item.id} className="grid gap-3 sm:grid-cols-3">
                  <Field
                    label="Nombre"
                    value={item.name}
                    onChange={(value) => {
                      setData((current) => {
                        const certifications = [...current.certifications];
                        certifications[index] = { ...item, name: value };
                        return { ...current, certifications };
                      });
                    }}
                  />
                  <Field
                    label="Emisor"
                    value={item.issuer}
                    onChange={(value) => {
                      setData((current) => {
                        const certifications = [...current.certifications];
                        certifications[index] = { ...item, issuer: value };
                        return { ...current, certifications };
                      });
                    }}
                  />
                  <div className="flex items-end gap-3">
                    <Field
                      label="Año"
                      value={item.year}
                      onChange={(value) => {
                        setData((current) => {
                          const certifications = [...current.certifications];
                          certifications[index] = { ...item, year: value };
                          return { ...current, certifications };
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="mb-2 text-sm text-muted hover:text-danger"
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          certifications: current.certifications.filter(
                            (row) => row.id !== item.id,
                          ),
                        }))
                      }
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        ) : null}

        {showMedio ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHead
              title="Idiomas"
              hint="Nivel real. Nativo, C1, B2… como en el marco europeo."
            />
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  languages: [...current.languages, emptyLanguage()],
                }))
              }
            >
              Añadir
            </button>
          </div>
          {data.languages.length === 0 ? (
            <p className="text-sm text-muted">Opcional: español, inglés, etc.</p>
          ) : (
            <div className="space-y-3">
              {data.languages.map((item, index) => (
                <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                  <Field
                    label="Idioma"
                    value={item.name}
                    onChange={(value) => {
                      setData((current) => {
                        const languages = [...current.languages];
                        languages[index] = { ...item, name: value };
                        return { ...current, languages };
                      });
                    }}
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
                      Nivel
                    </span>
                    <select
                      value={item.level}
                      onChange={(event) => {
                        setData((current) => {
                          const languages = [...current.languages];
                          languages[index] = {
                            ...item,
                            level: event.target.value,
                          };
                          return { ...current, languages };
                        });
                      }}
                      className="field"
                    >
                      {LANGUAGE_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="self-end min-h-11 pb-2 text-sm text-muted hover:text-danger"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        languages: current.languages.filter(
                          (row) => row.id !== item.id,
                        ),
                      }))
                    }
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        ) : null}

        <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-3 lg:rounded-2xl lg:border lg:border-line lg:bg-cream/95 lg:px-4 lg:py-3">
          <SaveBadge status={status} error={error} dirty={dirty} pdfStatus={pdfStatus} />
          <div className="flex flex-wrap gap-2">
            <ExportPdfButton
              onClick={() => void handleExportPdf()}
              busy={pdfStatus === "working"}
            />
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!dirty || status === "saving"}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "saving" ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      <aside
        className={`${
          pane === "preview" ? "block" : "hidden"
        } lg:sticky lg:top-24 lg:block lg:self-start`}
      >
        <CvPreview data={data} title={title} sheetRef={sheetRef} />
      </aside>
    </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <SaveBadge status={status} error={error} dirty={dirty} pdfStatus={pdfStatus} />
          <CvScoreBadge score={score} size="sm" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ExportPdfButton
            onClick={() => void handleExportPdf()}
            busy={pdfStatus === "working"}
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!dirty || status === "saving"}
            className="rounded-full bg-accent px-4 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "saving" ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </span>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field disabled:bg-line/40"
      />
    </label>
  );
}

function BulletEditor({
  values,
  onChange,
  placeholder = "Logro con cifra: aumenté X en un Y%",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <span className="mt-2.5 text-muted">•</span>
          <input
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
            className="field"
            placeholder={placeholder}
          />
          <button
            type="button"
            className="text-sm text-muted hover:text-danger"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-accent hover:underline"
        onClick={() => onChange([...values, ""])}
      >
        Añadir viñeta
      </button>
    </div>
  );
}

function ExportPdfButton({
  onClick,
  busy,
}: {
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-full border border-line bg-field px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60 lg:py-2.5"
    >
      {busy ? "Creando PDF…" : "Exportar PDF"}
    </button>
  );
}

function SaveBadge({
  status,
  error,
  dirty,
  pdfStatus,
  className = "",
}: {
  status: SaveState;
  error: string | null;
  dirty: boolean;
  pdfStatus: "idle" | "working" | "error";
  className?: string;
}) {
  const label =
    pdfStatus === "working"
      ? "Preparando el PDF…"
      : pdfStatus === "error"
        ? "No se pudo crear el PDF. Prueba de nuevo."
      : status === "saving"
        ? "Guardando…"
        : status === "error"
          ? error || "Error al guardar"
          : dirty
            ? "Tienes cambios sin guardar"
            : status === "saved"
              ? "Guardado"
              : "Completa tus datos y pulsa Guardar";

  return (
    <p
      className={`text-sm ${
        status === "error" || pdfStatus === "error" ? "text-danger" : "text-muted"
      } ${className}`}
    >
      {label}
    </p>
  );
}

async function saveCv(
  id: string,
  title: string,
  data: CvData,
  setStatus: (status: SaveState) => void,
  setError: (message: string | null) => void,
  onSaved: () => void,
) {
  setStatus("saving");
  setError(null);

  try {
    if (isLocalCvId(id)) {
      saveLocalCv(id, title, data);
      onSaved();
      setStatus("saved");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("cvs")
      .update({
        title: title.trim() || "Mi CV",
        data: cvDataToJson(data),
      })
      .eq("id", id);

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    onSaved();
    setStatus("saved");
  } catch (caught) {
    setStatus("error");
    setError(
      caught instanceof Error ? caught.message : "No se pudo guardar el CV.",
    );
  }
}
