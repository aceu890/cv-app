"use client";

import { CV_TEMPLATES, type CvTemplateId } from "@/lib/cv/templates";

export function TemplatePicker({
  value,
  onChange,
}: {
  value: CvTemplateId;
  onChange: (id: CvTemplateId) => void;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-serif text-2xl">Plantillas</h2>
        <p className="mt-1 text-sm text-muted">
          Cada una cambia el layout. Desliza en el teléfono para verlas todas.
          Harvard es la opción ATS.
        </p>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
        {CV_TEMPLATES.map((template) => {
          const selected = template.id === value;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={`w-[9.5rem] shrink-0 snap-start rounded-xl border p-2 text-left transition-colors sm:w-auto ${
                selected
                  ? "border-accent bg-cream"
                  : "border-line bg-field hover:border-ink/30"
              }`}
            >
              <TemplateThumb id={template.id} />
              <p className="mt-2 text-sm font-medium">
                {template.name}
                {"recommended" in template && template.recommended ? (
                  <span className="ml-1 text-[10px] font-medium tracking-wide text-accent uppercase">
                    ATS
                  </span>
                ) : null}
              </p>
              <p className="text-[11px] leading-snug text-muted">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TemplateThumb({ id }: { id: CvTemplateId }) {
  switch (id) {
    case "atlas":
      return (
        <div className="h-16 rounded-md border border-line/80 bg-white p-2">
          <div className="h-2 w-10 bg-black" />
          <div className="mt-1.5 h-0.5 w-full bg-black" />
          <div className="mt-2 flex justify-between">
            <div className="h-1 w-8 bg-[#d4d4d4]" />
            <div className="h-1 w-4 bg-[#d4d4d4]" />
          </div>
          <div className="mt-1 h-1 w-full bg-[#ececec]" />
        </div>
      );
    case "nordico":
      return (
        <div className="h-16 rounded-md border border-line/80 bg-[#f4f7fa] p-2">
          <div className="h-2.5 w-14 bg-[#1a2332]/80" />
          <div className="mt-1 h-1 w-10 bg-[#0f766e]/40" />
          <div className="mt-2 flex gap-1">
            <div className="h-2 w-5 rounded-full bg-[#0f766e]/25" />
            <div className="h-2 w-6 rounded-full bg-[#0f766e]/25" />
          </div>
        </div>
      );
    case "ejecutivo":
      return (
        <div className="h-16 overflow-hidden rounded-md border border-line/80">
          <div className="h-6 bg-[#1b2a4a] px-2 pt-1.5">
            <div className="h-1.5 w-10 bg-white/80" />
            <div className="mt-1 h-1 w-6 bg-[#c4a574]/80" />
          </div>
          <div className="grid h-10 grid-cols-[1.2fr_0.8fr] gap-1 bg-white p-1.5">
            <div className="space-y-1">
              <div className="h-1 w-full bg-[#e2d9cc]" />
              <div className="h-1 w-10/12 bg-[#e2d9cc]" />
            </div>
            <div className="bg-[#f7f4ee]" />
          </div>
        </div>
      );
    case "columna":
      return (
        <div className="flex h-16 overflow-hidden rounded-md border border-line/80">
          <div className="w-[36%] bg-[#1c1915] p-1.5">
            <div className="h-1.5 w-6 bg-[#f4efe6]/80" />
            <div className="mt-2 h-1 w-full bg-[#d4c4a8]/40" />
            <div className="mt-1 h-1 w-4/5 bg-[#d4c4a8]/40" />
          </div>
          <div className="flex-1 bg-white p-1.5">
            <div className="h-1 w-full bg-[#e2d9cc]" />
            <div className="mt-1 h-1 w-10/12 bg-[#e2d9cc]" />
            <div className="mt-1 h-1 w-8/12 bg-[#e2d9cc]" />
          </div>
        </div>
      );
    case "academia":
      return (
        <div className="h-16 rounded-md border border-line/80 bg-[#fffdf8] p-2">
          <div className="h-1.5 w-12 bg-[#1c1915]" />
          <div className="mt-1.5 h-0.5 w-full bg-[#1c1915]" />
          <div className="mt-2 flex justify-between">
            <div className="h-1 w-9 bg-[#d6d3d1]" />
            <div className="h-1 w-4 bg-[#d6d3d1]" />
          </div>
          <div className="mt-1 h-1 w-full bg-[#e7e5e4]" />
        </div>
      );
    case "tecnico":
      return (
        <div className="h-16 rounded-md border border-line/80 bg-white p-2">
          <div className="flex justify-between border-b-2 border-black pb-1">
            <div className="h-2 w-8 bg-[#111]" />
            <div className="h-2 w-6 bg-[#cbd5e1]" />
          </div>
          <div className="mt-1.5 flex gap-2">
            <div className="w-px bg-[#cbd5e1]" />
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full bg-[#e2e8f0]" />
              <div className="h-1 w-4/5 bg-[#e2e8f0]" />
            </div>
          </div>
        </div>
      );
    case "metro":
      return (
        <div className="h-16 overflow-hidden rounded-md border border-line/80 bg-white">
          <div className="h-1.5 bg-[#0f766e]" />
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="h-3 w-10 bg-[#0f172a]" />
            <div className="space-y-1">
              <div className="ml-auto h-1 w-8 bg-[#cbd5e1]" />
              <div className="ml-auto h-1 w-6 bg-[#cbd5e1]" />
            </div>
          </div>
        </div>
      );
    case "aurora":
      return (
        <div className="h-16 rounded-md border border-line/80 bg-white p-2">
          <div className="h-3 w-16 bg-[#292524]/80" />
          <div className="mt-1 h-px w-full bg-[#292524]" />
          <div className="mt-2 grid grid-cols-[1.2fr_0.8fr] gap-2">
            <div className="space-y-1">
              <div className="h-1 w-full bg-[#e7e5e4]" />
              <div className="h-1 w-4/5 bg-[#e7e5e4]" />
            </div>
            <div className="border-l border-[#e7e5e4] pl-1">
              <div className="h-1 w-full bg-[#e7e5e4]" />
            </div>
          </div>
        </div>
      );
    case "terra":
      return (
        <div className="flex h-16 overflow-hidden rounded-md border border-line/80 bg-[#faf4ef]">
          <div className="w-1.5 bg-[#9a4a2e]" />
          <div className="flex-1 p-2">
            <div className="h-2 w-12 bg-[#3f2e22]" />
            <div className="mt-1.5 h-3 w-full bg-[#efe4d8]" />
            <div className="mt-1 h-1 w-10/12 bg-[#d9c8b8]" />
          </div>
        </div>
      );
    case "dossier":
      return (
        <div className="flex h-16 overflow-hidden rounded-md border border-line/80">
          <div className="w-[28%] bg-[#1e2a38] p-1.5">
            <div className="h-1.5 w-7 bg-white/90" />
            <div className="mt-0.5 h-1.5 w-8 bg-[#2e7d7b]" />
            <div className="mt-1.5 h-1 w-full bg-[#2e7d7b]/80" />
            <div className="mt-1 h-1 w-4/5 bg-[#d7e1ea]/40" />
          </div>
          <div className="flex-1 bg-white p-1.5">
            <div className="h-1 w-8 bg-[#222222]" />
            <div className="mt-1 h-px w-full bg-[#2e7d7b]" />
            <div className="mt-1.5 h-1 w-full bg-[#e5e5e5]" />
            <div className="mt-1 h-1 w-10/12 bg-[#e5e5e5]" />
          </div>
        </div>
      );
    default:
      return (
        <div className="h-16 rounded-md border border-line/80 bg-white p-2">
          <div className="mx-auto h-2 w-12 bg-[#1c1915]" />
          <div className="mx-auto mt-1 h-1 w-10 bg-[#1c1915]/40" />
          <div className="mt-2 h-px w-full bg-black" />
          <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full bg-[#e2d9cc]" />
            <div className="h-1 w-10/12 bg-[#e2d9cc]" />
          </div>
        </div>
      );
  }
}
