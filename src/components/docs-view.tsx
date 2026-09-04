"use client";

import { useEffect, useState } from "react";
import {
  DOC_COPY,
  type DocBlock,
  type DocLocale,
} from "@/lib/docs/content";

const STORAGE_KEY = "folio-docs-locale";

export function DocsView() {
  const [locale, setLocale] = useState<DocLocale>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") {
        setLocale(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function changeLocale(next: DocLocale) {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const copy = DOC_COPY[locale];

  return (
    <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <aside className="mb-8 lg:mb-0">
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
            {copy.toc}
          </p>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {copy.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="shrink-0 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-cream hover:text-ink lg:rounded-lg"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <article className="min-w-0">
        <div className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
              {copy.kicker}
            </p>
            <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {copy.lead}
            </p>
          </div>
          <div
            className="flex shrink-0 rounded-full border border-line bg-cream p-1"
            role="group"
            aria-label={copy.localeLabel}
          >
            {(["en", "es"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => changeLocale(id)}
                className={`min-h-10 rounded-full px-3.5 text-sm transition-colors ${
                  locale === id
                    ? "bg-ink text-paper"
                    : "text-muted hover:text-ink"
                }`}
              >
                {id === "en" ? "EN" : "ES"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-14">
          {copy.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <h2 className="font-serif text-2xl tracking-tight">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.blocks.map((block, index) => (
                  <DocBlockView
                    key={`${section.id}-${index}`}
                    block={block}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-line pt-6 text-sm text-muted">
          {copy.repo}
        </p>
      </article>
    </div>
  );
}

function DocBlockView({ block }: { block: DocBlock }) {
  if (block.type === "p") {
    return <p className="leading-relaxed text-ink/90">{block.text}</p>;
  }

  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ol") {
    return (
      <ol className="list-decimal space-y-2 pl-5 leading-relaxed text-ink/90">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "note") {
    return (
      <p className="rounded-xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-muted">
        {block.text}
      </p>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="overflow-x-auto rounded-xl border border-line bg-ink px-4 py-3 font-mono text-[12px] leading-relaxed text-paper">
        <code>{block.text}</code>
      </pre>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-cream">
            {block.headers.map((header) => (
              <th
                key={header}
                className="px-3.5 py-2.5 font-medium text-ink"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr
              key={row.join("|")}
              className={
                rowIndex < block.rows.length - 1 ? "border-b border-line" : ""
              }
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={`px-3.5 py-2.5 align-top leading-relaxed ${
                    cellIndex === 0
                      ? "whitespace-nowrap font-medium text-ink"
                      : "text-muted"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
