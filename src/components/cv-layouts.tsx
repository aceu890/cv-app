import type { ReactNode } from "react";
import type { CvTemplateId } from "@/lib/cv/templates";

export type PreviewModel = {
  name: string;
  title: string;
  contacts: string[];
  summary: string;
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    dates: string;
    highlights: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    year: string;
    details: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    bullets: string[];
  }>;
  languages: Array<{ id: string; name: string; level: string }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    year: string;
  }>;
};

export function CvLayout({
  template,
  model,
}: {
  template: CvTemplateId;
  model: PreviewModel;
}) {
  switch (template) {
    case "atlas":
      return <AtlasLayout model={model} />;
    case "nordico":
      return <NordicoLayout model={model} />;
    case "ejecutivo":
      return <EjecutivoLayout model={model} />;
    case "columna":
      return <ColumnaLayout model={model} />;
    case "academia":
      return <AcademiaLayout model={model} />;
    case "tecnico":
      return <TecnicoLayout model={model} />;
    case "metro":
      return <MetroLayout model={model} />;
    case "aurora":
      return <AuroraLayout model={model} />;
    case "terra":
      return <TerraLayout model={model} />;
    case "dossier":
      return <DossierLayout model={model} />;
    default:
      return <HarvardLayout model={model} />;
  }
}

function Disc({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-4.5">
      {items.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function HarvardLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white px-7 py-6.5 font-serif text-[11.5px] leading-[1.25] text-black">
      <header className="text-center">
        <h1 className="text-[22px] font-semibold tracking-wide uppercase">
          {model.name}
        </h1>
        {model.contacts.length > 0 ? (
          <p className="mt-1.5 wrap-break-word text-[10.5px]">{model.contacts.join("  |  ")}</p>
        ) : null}
      </header>
      {model.summary ? (
        <HarvardSection title="Perfil profesional">
          <p className="whitespace-pre-wrap">{model.summary}</p>
        </HarvardSection>
      ) : null}
      {model.experience.length > 0 ? (
        <HarvardSection title="Experiencia profesional">
          <div className="space-y-3">
            {model.experience.map((item) => (
              <div key={item.id}>
                <p className="text-[12px] font-bold">
                  {[item.company || "Empresa", item.location]
                    .filter(Boolean)
                    .join(" — ")}
                </p>
                {item.role ? <p>{item.role}</p> : null}
                {item.dates ? <p className="text-[11px]">{item.dates}</p> : null}
                <Disc items={item.highlights} />
              </div>
            ))}
          </div>
        </HarvardSection>
      ) : null}
      {model.education.length > 0 ? (
        <HarvardSection title="Educación">
          <div className="space-y-2.5">
            {model.education.map((item) => (
              <div key={item.id}>
                <p className="text-[12px] font-bold">
                  {item.school || "Institución"}
                </p>
                {item.degree ? <p>{item.degree}</p> : null}
                {item.year ? <p className="text-[11px]">{item.year}</p> : null}
                {item.details ? <p>{item.details}</p> : null}
              </div>
            ))}
          </div>
        </HarvardSection>
      ) : null}
      {model.skills.length > 0 ? (
        <HarvardSection title="Habilidades técnicas">
          <Disc items={model.skills} />
        </HarvardSection>
      ) : null}
      {model.projects.length > 0 ? (
        <HarvardSection title="Proyectos destacados">
          <div className="space-y-3">
            {model.projects.map((item) => (
              <div key={item.id}>
                <p className="text-[12px] font-bold">{item.name || "Proyecto"}</p>
                <Disc items={item.bullets} />
              </div>
            ))}
          </div>
        </HarvardSection>
      ) : null}
      {model.certifications.length > 0 ? (
        <HarvardSection title="Certificaciones / Cursos">
          <Disc
            items={model.certifications.map(
              (item) =>
                `${item.name}${item.issuer ? ` — ${item.issuer}` : ""}${item.year ? ` (${item.year})` : ""}`,
            )}
          />
        </HarvardSection>
      ) : null}
      {model.languages.length > 0 ? (
        <HarvardSection title="Idiomas">
          <Disc
            items={model.languages.map(
              (item) => `${item.name}${item.level ? ` (${item.level})` : ""}`,
            )}
          />
        </HarvardSection>
      ) : null}
    </article>
  );
}

function HarvardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-3.25">
      <h2 className="border-b border-black pb-0.75 text-[11px] font-bold tracking-[0.12em] uppercase">
        {title}
      </h2>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

function AtlasLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white px-6 py-5 text-[10.5px] leading-[1.15] text-[#111]">
      <header className="pb-2">
        <h1 className="text-[18px] font-bold tracking-tight">{model.name}</h1>
        {model.contacts.length > 0 ? (
          <p className="mt-0.5 wrap-break-word text-[10px] text-[#444]">
            {model.contacts.join(" · ")}
          </p>
        ) : null}
        <div className="mt-2 h-0.5 bg-black" />
        <div className="mt-px h-px bg-black" />
      </header>
      {model.summary ? (
        <section className="mt-3">
          <p className="whitespace-pre-wrap">{model.summary}</p>
        </section>
      ) : null}
      {model.experience.length > 0 ? (
        <AtlasSection title="Experiencia">
          <div className="space-y-2.5">
            {model.experience.map((item) => (
              <div key={item.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-bold uppercase tracking-wide">
                    {item.company || "Empresa"}
                    {item.location ? `, ${item.location}` : ""}
                  </p>
                  {item.dates ? (
                    <p className="shrink-0 text-[10px]">{item.dates}</p>
                  ) : null}
                </div>
                {item.role ? (
                  <p className="italic text-[#333]">{item.role}</p>
                ) : null}
                <Disc items={item.highlights} />
              </div>
            ))}
          </div>
        </AtlasSection>
      ) : null}
      {model.education.length > 0 ? (
        <AtlasSection title="Educación">
          {model.education.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3">
              <p>
                <span className="font-bold">{item.school}</span>
                {item.degree ? ` — ${item.degree}` : ""}
              </p>
              {item.year ? <p className="shrink-0">{item.year}</p> : null}
            </div>
          ))}
        </AtlasSection>
      ) : null}
      {model.projects.length > 0 ? (
        <AtlasSection title="Proyectos">
          {model.projects.map((item) => (
            <p key={item.id}>
              <span className="font-bold">{item.name}.</span>{" "}
              {item.bullets.join(" ")}
            </p>
          ))}
        </AtlasSection>
      ) : null}
      {model.skills.length > 0 ? (
        <AtlasSection title="Competencias">
          <p>{model.skills.join(" · ")}</p>
        </AtlasSection>
      ) : null}
      {model.languages.length > 0 || model.certifications.length > 0 ? (
        <AtlasSection title="Adicional">
          {model.languages.length > 0 ? (
            <p>
              Idiomas:{" "}
              {model.languages
                .map((item) => `${item.name} ${item.level}`.trim())
                .join(" · ")}
            </p>
          ) : null}
          {model.certifications.map((item) => (
            <p key={item.id}>
              {item.name}
              {item.issuer ? `, ${item.issuer}` : ""}
              {item.year ? ` (${item.year})` : ""}
            </p>
          ))}
        </AtlasSection>
      ) : null}
    </article>
  );
}

function AtlasSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-3">
      <h2 className="mb-1 text-[9.5px] font-bold tracking-[0.18em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function NordicoLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-[#f4f7fa] px-8 py-9 text-[11.5px] leading-[1.25] text-[#1a2332]">
      <header className="mb-6">
        <h1 className="text-[26px] font-light tracking-tight">{model.name}</h1>
        {model.title ? (
          <p className="mt-1 text-[11px] font-medium tracking-[0.16em] text-[#0f766e] uppercase">
            {model.title}
          </p>
        ) : null}
        {model.contacts.length > 0 ? (
          <p className="mt-2 wrap-break-word text-[10.5px] text-[#475569]">
            {model.contacts.join("  ·  ")}
          </p>
        ) : null}
      </header>
      {model.skills.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {model.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#0f766e]/30 bg-white px-2.5 py-0.5 text-[10px] text-[#0f766e]"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}
      {model.summary ? (
        <p className="mb-6 whitespace-pre-wrap text-[#334155]">{model.summary}</p>
      ) : null}
      {model.experience.length > 0 ? (
        <NordicoSection title="Experiencia">
          <div className="space-y-4">
            {model.experience.map((item) => (
              <div key={item.id}>
                <p className="text-[13px] font-medium">{item.role || "Puesto"}</p>
                <p className="text-[11px] text-[#0f766e]">
                  {item.company}
                  {item.location ? ` · ${item.location}` : ""}
                  {item.dates ? ` · ${item.dates}` : ""}
                </p>
                <Disc items={item.highlights} />
              </div>
            ))}
          </div>
        </NordicoSection>
      ) : null}
      {model.education.length > 0 ? (
        <NordicoSection title="Formación">
          {model.education.map((item) => (
            <p key={item.id}>
              {item.degree} · {item.school}
              {item.year ? ` (${item.year})` : ""}
            </p>
          ))}
        </NordicoSection>
      ) : null}
      {model.projects.length > 0 ? (
        <NordicoSection title="Proyectos">
          {model.projects.map((item) => (
            <div key={item.id} className="mb-2">
              <p className="font-medium">{item.name}</p>
              <Disc items={item.bullets} />
            </div>
          ))}
        </NordicoSection>
      ) : null}
      <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
        {model.languages.length > 0 ? (
          <div>
            <p className="text-[10px] tracking-[0.14em] text-[#0f766e] uppercase">
              Idiomas
            </p>
            {model.languages.map((item) => (
              <p key={item.id}>
                {item.name} {item.level}
              </p>
            ))}
          </div>
        ) : null}
        {model.certifications.length > 0 ? (
          <div>
            <p className="text-[10px] tracking-[0.14em] text-[#0f766e] uppercase">
              Cursos
            </p>
            {model.certifications.map((item) => (
              <p key={item.id}>{item.name}</p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function NordicoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-2 bg-[#0f766e]" />
        <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EjecutivoLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white text-[11px] leading-[1.25] text-[#1b2430]">
      <header className="shrink-0 bg-[#1b2a4a] px-7 py-6 text-white">
        <h1 className="font-serif text-[24px] font-semibold">{model.name}</h1>
        {model.title ? (
          <p className="mt-1 text-[11px] tracking-[0.12em] text-[#c4a574] uppercase">
            {model.title}
          </p>
        ) : null}
        {model.contacts.length > 0 ? (
          <p className="mt-3 wrap-break-word text-[10px] text-white/80">
            {model.contacts.join("  |  ")}
          </p>
        ) : null}
      </header>
      <div className="grid flex-1 grid-cols-[1.2fr_0.8fr] gap-5 px-6 py-5">
        <div>
          {model.experience.length > 0 ? (
            <ExecSection title="Experiencia">
              {model.experience.map((item) => (
                <div key={item.id} className="mb-3">
                  <p className="font-semibold">{item.role}</p>
                  <p className="text-[10.5px] text-[#1b2a4a]">
                    {item.company} · {item.dates}
                  </p>
                  <Disc items={item.highlights} />
                </div>
              ))}
            </ExecSection>
          ) : null}
          {model.projects.length > 0 ? (
            <ExecSection title="Proyectos">
              {model.projects.map((item) => (
                <div key={item.id} className="mb-2">
                  <p className="font-semibold">{item.name}</p>
                  <Disc items={item.bullets} />
                </div>
              ))}
            </ExecSection>
          ) : null}
        </div>
        <aside>
          {model.summary ? (
            <div className="mb-4 border border-[#c4a574]/50 bg-[#f7f4ee] p-3">
              <p className="mb-1 text-[9.5px] tracking-[0.14em] text-[#1b2a4a] uppercase">
                Perfil
              </p>
              <p className="whitespace-pre-wrap text-[10.5px]">{model.summary}</p>
            </div>
          ) : null}
          {model.education.length > 0 ? (
            <ExecSection title="Educación">
              {model.education.map((item) => (
                <div key={item.id} className="mb-2">
                  <p className="font-semibold">{item.school}</p>
                  <p>{item.degree}</p>
                  <p className="text-[10px]">{item.year}</p>
                </div>
              ))}
            </ExecSection>
          ) : null}
          {model.skills.length > 0 ? (
            <ExecSection title="Habilidades">
              <ul className="space-y-0.5">
                {model.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </ExecSection>
          ) : null}
          {model.languages.length > 0 ? (
            <ExecSection title="Idiomas">
              {model.languages.map((item) => (
                <p key={item.id}>
                  {item.name} — {item.level}
                </p>
              ))}
            </ExecSection>
          ) : null}
          {model.certifications.length > 0 ? (
            <ExecSection title="Certificaciones">
              {model.certifications.map((item) => (
                <p key={item.id}>{item.name}</p>
              ))}
            </ExecSection>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function ExecSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 border-b border-[#c4a574] pb-1 font-serif text-[12px] text-[#1b2a4a]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColumnaLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex items-stretch bg-white text-[11px] leading-[1.25] text-[#1c1915]">
      <aside className="flex w-[36%] shrink-0 flex-col bg-[#1c1915] px-4 py-6 font-serif text-[#f4efe6]">
        <h1 className="text-[18px] leading-tight font-semibold">{model.name}</h1>
        {model.title ? (
          <p className="mt-2 text-[10px] tracking-wide text-[#d4c4a8] uppercase">
            {model.title}
          </p>
        ) : null}
        <div className="mt-5 space-y-1.5 text-[10px] text-[#e8dfd0]">
          {model.contacts.map((item) => (
            <p key={item} className="wrap-break-word">
              {item}
            </p>
          ))}
        </div>
        {model.skills.length > 0 ? (
          <div className="mt-6">
            <p className="text-[10px] tracking-[0.14em] text-[#d4c4a8] uppercase">
              Skills
            </p>
            <ul className="mt-2 space-y-1 text-[10.5px]">
              {model.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {model.languages.length > 0 ? (
          <div className="mt-6">
            <p className="text-[10px] tracking-[0.14em] text-[#d4c4a8] uppercase">
              Idiomas
            </p>
            <ul className="mt-2 space-y-1 text-[10.5px]">
              {model.languages.map((item) => (
                <li key={item.id}>
                  {item.name} ({item.level})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
      <div className="min-w-0 flex-1 px-5 py-6">
        {model.summary ? (
          <p className="mb-4 whitespace-pre-wrap text-[#44403c]">{model.summary}</p>
        ) : null}
        {model.experience.length > 0 ? (
          <section className="mb-4">
            <h2 className="mb-2 border-b border-[#1c1915] pb-1 font-serif text-[12px] font-semibold tracking-wide uppercase">
              Experiencia
            </h2>
            {model.experience.map((item) => (
              <div key={item.id} className="mb-3">
                <p className="font-semibold">{item.role}</p>
                <p className="text-[10.5px]">
                  {item.company} · {item.dates}
                </p>
                <Disc items={item.highlights} />
              </div>
            ))}
          </section>
        ) : null}
        {model.education.length > 0 ? (
          <section className="mb-4">
            <h2 className="mb-2 border-b border-[#1c1915] pb-1 font-serif text-[12px] font-semibold tracking-wide uppercase">
              Educación
            </h2>
            {model.education.map((item) => (
              <p key={item.id} className="mb-1">
                {item.degree}, {item.school} {item.year}
              </p>
            ))}
          </section>
        ) : null}
        {model.projects.length > 0 ? (
          <section className="mb-4">
            <h2 className="mb-2 border-b border-[#1c1915] pb-1 font-serif text-[12px] font-semibold tracking-wide uppercase">
              Proyectos
            </h2>
            {model.projects.map((item) => (
              <div key={item.id} className="mb-2">
                <p className="font-semibold">{item.name}</p>
                <Disc items={item.bullets} />
              </div>
            ))}
          </section>
        ) : null}
        {model.certifications.length > 0 ? (
          <section>
            <h2 className="mb-2 border-b border-[#1c1915] pb-1 font-serif text-[12px] font-semibold tracking-wide uppercase">
              Certificaciones
            </h2>
            {model.certifications.map((item) => (
              <p key={item.id}>
                {item.name} {item.year}
              </p>
            ))}
          </section>
        ) : null}
      </div>
    </article>
  );
}

function AcademiaLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-[#fffdf8] px-7 py-7 font-serif text-[11.5px] leading-[1.25] text-[#1c1915]">
      <header className="mb-4">
        <h1 className="text-[20px]">{model.name}</h1>
        {model.title ? (
          <p className="mt-0.5 italic text-[#57534d]">{model.title}</p>
        ) : null}
        {model.contacts.length > 0 ? (
          <p className="mt-1 text-[10.5px]">{model.contacts.join(" · ")}</p>
        ) : null}
        <div className="mt-3 h-0.5 bg-[#1c1915]" />
      </header>
      {model.education.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-wide uppercase">
            Educación
          </h2>
          {model.education.map((item) => (
            <div key={item.id} className="mb-2 flex justify-between gap-3">
              <div>
                <p className="font-semibold">{item.school}</p>
                <p>{item.degree}</p>
                {item.details ? (
                  <p className="italic text-[#57534d]">{item.details}</p>
                ) : null}
              </div>
              <p className="shrink-0">{item.year}</p>
            </div>
          ))}
        </section>
      ) : null}
      {model.summary ? (
        <section className="mb-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-wide uppercase">
            Perfil académico
          </h2>
          <p className="whitespace-pre-wrap">{model.summary}</p>
        </section>
      ) : null}
      {model.experience.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-wide uppercase">
            Nombramientos y experiencia
          </h2>
          {model.experience.map((item) => (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">
                  {item.role}, {item.company}
                </p>
                <p className="shrink-0">{item.dates}</p>
              </div>
              <Disc items={item.highlights} />
            </div>
          ))}
        </section>
      ) : null}
      {model.projects.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-wide uppercase">
            Investigación y proyectos
          </h2>
          {model.projects.map((item) => (
            <p key={item.id} className="mb-1">
              <span className="italic">{item.name}.</span> {item.bullets.join(" ")}
            </p>
          ))}
        </section>
      ) : null}
      {model.certifications.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-wide uppercase">
            Formación continua
          </h2>
          {model.certifications.map((item) => (
            <p key={item.id}>
              {item.name}
              {item.issuer ? `. ${item.issuer}` : ""}
              {item.year ? `, ${item.year}` : ""}
            </p>
          ))}
        </section>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-4 text-[11px]">
        {model.skills.length > 0 ? (
          <p>
            <span className="font-semibold">Métodos: </span>
            {model.skills.join(", ")}
          </p>
        ) : null}
        {model.languages.length > 0 ? (
          <p>
            <span className="font-semibold">Idiomas: </span>
            {model.languages
              .map((item) => `${item.name} (${item.level})`)
              .join(", ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function TecnicoLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white px-6 py-5 font-sans text-[11px] leading-[1.15] text-[#111]">
      <header className="flex items-end justify-between gap-4 border-b-2 border-black pb-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">{model.name}</h1>
          {model.title ? (
            <p className="font-mono text-[10px] text-[#334155]">{model.title}</p>
          ) : null}
        </div>
        <div className="max-w-[55%] min-w-0 text-right text-[10px] wrap-break-word text-[#475569]">
          {model.contacts.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </header>
      {model.skills.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1 border-b border-[#e2e8f0] pb-3 font-mono text-[10px]">
          {model.skills.map((skill) => (
            <p key={skill}>/ {skill}</p>
          ))}
        </div>
      ) : null}
      {model.summary ? (
        <p className="mt-3 whitespace-pre-wrap text-[#334155]">{model.summary}</p>
      ) : null}
      {model.experience.length > 0 ? (
        <section className="mt-4">
          <h2 className="mb-2 font-mono text-[10px] tracking-[0.16em] uppercase">
            Experiencia
          </h2>
          <div className="space-y-3 border-l-2 border-[#cbd5e1] pl-4">
            {model.experience.map((item) => (
              <div key={item.id} className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-black" />
                <p className="font-semibold">{item.role}</p>
                <p className="font-mono text-[10px] text-[#475569]">
                  {item.company} · {item.dates}
                </p>
                <Disc items={item.highlights} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {model.projects.length > 0 ? (
        <section className="mt-4">
          <h2 className="mb-2 font-mono text-[10px] tracking-[0.16em] uppercase">
            Proyectos
          </h2>
          <div className="grid gap-2">
            {model.projects.map((item, index) => (
              <div key={item.id} className="border border-[#e2e8f0] px-3 py-2">
                <p className="font-mono text-[10px] text-[#64748b]">
                  0{index + 1}
                </p>
                <p className="font-semibold">{item.name}</p>
                <Disc items={item.bullets} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-auto grid grid-cols-2 gap-4 pt-4">
        {model.education.length > 0 ? (
          <div>
            <h2 className="mb-1 font-mono text-[10px] tracking-[0.16em] uppercase">
              Educación
            </h2>
            {model.education.map((item) => (
              <p key={item.id}>
                {item.degree} · {item.school}
              </p>
            ))}
          </div>
        ) : null}
        <div>
          {model.languages.map((item) => (
            <p key={item.id} className="font-mono text-[10px]">
              {item.name}:{item.level}
            </p>
          ))}
          {model.certifications.map((item) => (
            <p key={item.id}>{item.name}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function MetroLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white text-[11px] leading-[1.25] text-[#0f172a]">
      <div className="h-2 bg-[#0f766e]" />
      <header className="grid grid-cols-2 gap-4 px-6 pt-5 pb-4">
        <div>
          <h1 className="text-[26px] leading-none font-semibold tracking-tight">
            {model.name}
          </h1>
          {model.title ? (
            <p className="mt-2 text-[11px] text-[#0f766e]">{model.title}</p>
          ) : null}
        </div>
        <div className="text-right text-[10.5px] text-[#475569]">
          {model.contacts.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </header>
      {model.summary ? (
        <p className="mx-6 mb-4 border-l-4 border-[#0f766e] pl-3 whitespace-pre-wrap text-[#334155]">
          {model.summary}
        </p>
      ) : null}
      {model.experience.length > 0 ? (
        <section className="px-6">
          <h2 className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#0f766e] uppercase">
            Experiencia
          </h2>
          {model.experience.map((item) => (
            <div key={item.id} className="mb-3">
              <p>
                <span className="font-semibold">{item.role}</span>
                {item.company ? ` · ${item.company}` : ""}
              </p>
              <p className="text-[10px] tracking-wide text-[#64748b] uppercase">
                {[item.location, item.dates].filter(Boolean).join(" · ")}
              </p>
              <Disc items={item.highlights} />
            </div>
          ))}
        </section>
      ) : null}
      {model.skills.length > 0 ? (
        <section className="px-6">
          <h2 className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#0f766e] uppercase">
            Habilidades
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-x-4">
            {model.skills.map((skill) => (
              <p key={skill} className="border-b border-[#f1f5f9] py-0.5">
                {skill}
              </p>
            ))}
          </div>
        </section>
      ) : null}
      {model.projects.length > 0 ? (
        <section className="px-6">
          <h2 className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#0f766e] uppercase">
            Proyectos
          </h2>
          {model.projects.map((item) => (
            <p key={item.id} className="mb-1">
              <span className="font-semibold">{item.name}:</span>{" "}
              {item.bullets[0]}
            </p>
          ))}
        </section>
      ) : null}
      <footer className="mt-auto bg-[#f1f5f9] px-6 py-3">
        <div className="grid grid-cols-3 gap-3 text-[10.5px]">
          <div>
            {model.education.map((item) => (
              <p key={item.id}>
                {item.school} · {item.year}
              </p>
            ))}
          </div>
          <div>
            {model.languages.map((item) => (
              <p key={item.id}>
                {item.name} {item.level}
              </p>
            ))}
          </div>
          <div>
            {model.certifications.map((item) => (
              <p key={item.id}>{item.name}</p>
            ))}
          </div>
        </div>
      </footer>
    </article>
  );
}

function AuroraLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col bg-white px-7 py-7 font-serif text-[11.5px] leading-[1.25] text-[#292524]">
      <header className="mb-4">
        <h1 className="text-[30px] leading-[1.05] font-normal tracking-tight">
          {model.name}
        </h1>
        {model.title ? (
          <p className="mt-1 text-[12px] tracking-[0.2em] text-[#a8a29e] uppercase">
            {model.title}
          </p>
        ) : null}
        <div className="mt-4 h-px bg-[#292524]" />
      </header>
      <div className="grid flex-1 grid-cols-[1.15fr_0.85fr] gap-6">
        <div>
          {model.experience.length > 0 ? (
            <section className="mb-5">
              <h2 className="mb-3 text-[10px] tracking-[0.22em] uppercase">
                Experiencia
              </h2>
              {model.experience.map((item) => (
                <div key={item.id} className="mb-4">
                  <p className="text-[13px]">{item.role}</p>
                  <p className="text-[11px] text-[#78716c]">
                    {item.company} / {item.dates}
                  </p>
                  <Disc items={item.highlights} />
                </div>
              ))}
            </section>
          ) : null}
          {model.projects.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[10px] tracking-[0.22em] uppercase">
                Proyectos
              </h2>
              {model.projects.map((item) => (
                <div key={item.id} className="mb-3">
                  <p>{item.name}</p>
                  <Disc items={item.bullets} />
                </div>
              ))}
            </section>
          ) : null}
        </div>
        <aside className="border-l border-[#e7e5e4] pl-5">
          {model.contacts.length > 0 ? (
            <div className="mb-4 space-y-0.5 text-[10.5px]">
              {model.contacts.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}
          {model.summary ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[10px] tracking-[0.22em] uppercase">
                Sobre mí
              </h2>
              <p className="whitespace-pre-wrap text-[#57534d]">{model.summary}</p>
            </section>
          ) : null}
          {model.education.length > 0 ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[10px] tracking-[0.22em] uppercase">
                Estudios
              </h2>
              {model.education.map((item) => (
                <p key={item.id} className="mb-1">
                  {item.degree}
                  <br />
                  <span className="text-[#78716c]">{item.school}</span>
                </p>
              ))}
            </section>
          ) : null}
          {model.skills.length > 0 ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[10px] tracking-[0.22em] uppercase">
                Oficio
              </h2>
              {model.skills.map((skill) => (
                <p key={skill}>{skill}</p>
              ))}
            </section>
          ) : null}
          {model.languages.length > 0 ? (
            <section className="mb-4">
              <h2 className="mb-2 text-[10px] tracking-[0.22em] uppercase">
                Idiomas
              </h2>
              {model.languages.map((item) => (
                <p key={item.id}>
                  {item.name} {item.level}
                </p>
              ))}
            </section>
          ) : null}
          {model.certifications.length > 0 ? (
            <section>
              <h2 className="mb-2 text-[10px] tracking-[0.22em] uppercase">
                Cursos
              </h2>
              {model.certifications.map((item) => (
                <p key={item.id}>{item.name}</p>
              ))}
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function TerraLayout({ model }: { model: PreviewModel }) {
  return (
    <article className="cv-page flex flex-col border-l-[6px] border-[#9a4a2e] bg-[#faf4ef] px-6 py-6 text-[11.5px] leading-[1.25] text-[#3f2e22]">
      <header className="mb-4">
        <h1 className="font-serif text-[22px] font-semibold">{model.name}</h1>
        {model.title ? (
          <p className="text-[12px] text-[#9a4a2e]">{model.title}</p>
        ) : null}
        {model.contacts.length > 0 ? (
          <p className="mt-2 bg-[#efe4d8] px-3 py-1.5 text-[10.5px]">
            {model.contacts.join("  ·  ")}
          </p>
        ) : null}
      </header>
      {model.summary ? (
        <section className="mb-4 rounded-sm bg-white/80 p-3 shadow-[inset_0_0_0_1px_rgba(154,74,46,0.15)]">
          <p className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-[#9a4a2e] uppercase">
            Perfil
          </p>
          <p className="whitespace-pre-wrap">{model.summary}</p>
        </section>
      ) : null}
      {model.experience.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 font-serif text-[13px] text-[#9a4a2e]">
            Experiencia
          </h2>
          {model.experience.map((item) => (
            <div key={item.id} className="mb-3">
              <p className="text-[10px] tracking-[0.12em] uppercase">
                {item.company}
              </p>
              <p className="font-medium">
                {item.role}{" "}
                <span className="font-normal text-[#7c6a58]">{item.dates}</span>
              </p>
              <Disc items={item.highlights} />
            </div>
          ))}
        </section>
      ) : null}
      {model.skills.length > 0 ? (
        <p className="mb-4 text-[11px]">
          {model.skills.join("  ·  ")}
        </p>
      ) : null}
      {model.projects.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-2 font-serif text-[13px] text-[#9a4a2e]">
            Proyectos
          </h2>
          {model.projects.map((item) => (
            <p key={item.id} className="mb-1">
              <span className="font-medium">{item.name}.</span> {item.bullets[0]}
            </p>
          ))}
        </section>
      ) : null}
      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-[#d9c8b8] pt-3">
        <div>
          <h2 className="mb-1 font-serif text-[13px] text-[#9a4a2e]">Educación</h2>
          {model.education.map((item) => (
            <p key={item.id}>
              {item.degree}
              <br />
              {item.school} {item.year}
            </p>
          ))}
        </div>
        <div>
          {model.languages.map((item) => (
            <p key={item.id}>
              {item.name} ({item.level})
            </p>
          ))}
          {model.certifications.map((item) => (
            <p key={item.id} className="text-[10.5px]">
              {item.name}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

function splitDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: name, last: "" };
  if (parts.length === 2) return { first: parts[0], last: parts[1] };
  if (parts.length === 3) return { first: parts[0], last: parts.slice(1).join(" ") };
  const mid = Math.ceil(parts.length / 2);
  return {
    first: parts.slice(0, mid).join(" "),
    last: parts.slice(mid).join(" "),
  };
}

function skillGroups(skills: string[]) {
  return skills.map((skill) => {
    const index = skill.indexOf(":");
    if (index > 0) {
      return {
        label: skill.slice(0, index).trim(),
        items: skill
          .slice(index + 1)
          .trim()
          .replace(/,\s*/g, " · "),
      };
    }
    return { label: "", items: skill.replace(/,\s*/g, " · ") };
  });
}

function ArrowList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((line, index) => (
        <li key={`${line}-${index}`} className="flex gap-1.5">
          <span className="mt-px shrink-0 text-[13px] leading-[1.45] text-[#2e7d7b]">
            ▸
          </span>
          <span className="text-[13.5px] leading-[1.45] text-[#222222]">
            {line}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DossierHeading({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "side" | "main";
}) {
  if (tone === "side") {
    return (
      <div className="mt-6">
        <p className="text-[12px] font-bold tracking-[0.28em] text-white uppercase">
          {children}
        </p>
        <div className="mt-1.5 h-px bg-[#2e7d7b]" />
      </div>
    );
  }

  return (
    <div className="mb-3">
      <p className="text-[14.5px] font-bold uppercase text-[#222222]">
        {children}
      </p>
      <div className="mt-1 h-px bg-[#2e7d7b]" />
    </div>
  );
}

function DossierMeta({
  company,
  location,
}: {
  company: string;
  location: string;
}) {
  const parts = [company, location].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <span className="font-bold text-[#2e7d7b]"> — {parts.join(" — ")}</span>
  );
}

function DossierLayout({ model }: { model: PreviewModel }) {
  const { first, last } = splitDisplayName(model.name);
  const groups = skillGroups(model.skills);

  return (
    <article className="cv-page flex bg-white font-sans text-[13.5px] leading-[1.5] text-[#222222]">
      <aside className="flex w-[28%] shrink-0 flex-col bg-[#1e2a38] px-[25px] py-8 text-[#d7e1ea]">
        <h1 className="text-[20px] leading-[1.32] font-bold uppercase">
          <span className="block text-white">{first}</span>
          {last ? <span className="block text-[#2e7d7b]">{last}</span> : null}
        </h1>
        {model.title ? (
          <p className="mt-5 text-[11px] font-medium tracking-[0.22em] text-[#2e7d7b] uppercase">
            {model.title}
          </p>
        ) : null}

        {model.contacts.length > 0 ? (
          <div>
            <DossierHeading tone="side">Contacto</DossierHeading>
            <div className="mt-3 space-y-1.5 text-[12.5px] leading-[1.45] wrap-break-word">
              {model.contacts.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div>
            <DossierHeading tone="side">Habilidades técnicas</DossierHeading>
            <div className="mt-3 space-y-2.5">
              {groups.map((group) => (
                <div key={`${group.label}-${group.items}`}>
                  {group.label ? (
                    <p className="text-[12.5px] font-bold text-white">
                      {group.label}
                    </p>
                  ) : null}
                  <p className="text-[12.5px] leading-[1.4] text-[#d7e1ea]">
                    {group.items}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {model.languages.length > 0 ? (
          <div>
            <DossierHeading tone="side">Idiomas</DossierHeading>
            <div className="mt-3 space-y-1 text-[12.5px]">
              {model.languages.map((item) => (
                <p key={item.id}>
                  {item.name}
                  {item.level ? ` — ${item.level}` : ""}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {model.education.length > 0 ? (
          <div>
            <DossierHeading tone="side">Educación</DossierHeading>
            <div className="mt-3 space-y-3">
              {model.education.map((item) => (
                <div key={item.id}>
                  {item.degree ? (
                    <p className="text-[12.5px] leading-[1.4] font-bold text-white">
                      {item.degree}
                    </p>
                  ) : null}
                  {item.school ? (
                    <p className="text-[12.5px] text-[#d7e1ea]">{item.school}</p>
                  ) : null}
                  {item.year ? (
                    <p className="text-[12.5px] text-[#d7e1ea]">{item.year}</p>
                  ) : null}
                  {item.details ? (
                    <p className="mt-0.5 text-[12px] text-[#d7e1ea]">
                      {item.details}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {model.certifications.length > 0 ? (
          <div>
            <DossierHeading tone="side">Cursos</DossierHeading>
            <div className="mt-3 space-y-1.5 text-[12.5px]">
              {model.certifications.map((item) => (
                <p key={item.id}>
                  {item.name}
                  {item.issuer ? ` — ${item.issuer}` : ""}
                  {item.year ? ` (${item.year})` : ""}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col px-8 py-8">
        {model.summary ? (
          <section className="mb-6">
            <DossierHeading tone="main">Perfil profesional</DossierHeading>
            <p className="whitespace-pre-wrap text-[14px] leading-[1.52] text-[#222222]">
              {model.summary}
            </p>
          </section>
        ) : null}

        {model.experience.length > 0 ? (
          <section className="mb-6">
            <DossierHeading tone="main">Experiencia profesional</DossierHeading>
            <div className="space-y-4">
              {model.experience.map((item) => (
                <div key={item.id}>
                  <p className="text-[14.5px] leading-[1.35] font-bold text-[#222222]">
                    {item.role}
                    <DossierMeta
                      company={item.company}
                      location={item.location}
                    />
                  </p>
                  {item.dates ? (
                    <p className="mt-0.5 text-[11px] tracking-[0.08em] text-[#909090] uppercase">
                      {item.dates.replace(/\./g, "")}
                    </p>
                  ) : null}
                  <ArrowList items={item.highlights} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {model.projects.length > 0 ? (
          <section className="mb-6">
            <DossierHeading tone="main">Proyectos</DossierHeading>
            {model.projects.map((item) => (
              <div key={item.id} className="mb-2">
                <p className="text-[14.5px] font-bold text-[#222222]">
                  {item.name}
                </p>
                <ArrowList items={item.bullets} />
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </article>
  );
}
