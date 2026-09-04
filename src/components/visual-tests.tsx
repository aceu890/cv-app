"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_COPY } from "@/lib/tests/copy";
import { runClientChecks } from "@/lib/tests/run-client";
import type {
  CheckGroup,
  TestLocale,
  VisualCheck,
} from "@/lib/tests/types";

const STORAGE_KEY = "folio-docs-locale";
const GROUP_ORDER: CheckGroup[] = [
  "auth",
  "data",
  "schema",
  "export",
  "ui",
];

type VisualTestsProps = {
  initial: VisualCheck[];
};

export function VisualTests({ initial }: VisualTestsProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<TestLocale>("en");
  const [client, setClient] = useState<VisualCheck[] | null>(null);
  const [running, setRunning] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    setRunning(true);
    runClientChecks().then((result) => {
      if (!cancelled) {
        setClient(result);
        setRunning(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  function changeLocale(next: TestLocale) {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const checks = useMemo(() => [...initial, ...(client ?? [])], [initial, client]);
  const passed = checks.filter((item) => item.status === "pass").length;
  const failed = checks.filter((item) => item.status === "fail").length;
  const copy = TEST_COPY[locale];

  return (
    <div>
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {running ? (
            copy.running
          ) : (
            <>
              <span className="font-medium text-accent">
                {passed} {copy.passed}
              </span>
              {failed ? (
                <span className="ml-3 font-medium text-danger">
                  {failed} {copy.failed}
                </span>
              ) : null}
              <span className="ml-2">
                / {checks.length}
              </span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setClient(null);
            setRunning(true);
            router.refresh();
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-ink transition-colors hover:bg-cream"
        >
          {copy.rerun}
        </button>
      </div>

      <div className="mt-8 space-y-10">
        {GROUP_ORDER.map((group) => {
          const items = checks.filter((item) => item.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h2 className="font-serif text-2xl tracking-tight">
                {copy.groups[group]}
              </h2>
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-cream">
                {items.map((item) => {
                  const meta = copy.checks[item.id];
                  const ok = item.status === "pass";
                  return (
                    <li key={item.id} className="flex gap-4 px-4 py-4 sm:px-5">
                      <span
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          ok
                            ? "bg-accent text-on-accent"
                            : "bg-danger text-paper"
                        }`}
                        aria-label={ok ? copy.passed : copy.failed}
                      >
                        {ok ? "✓" : "!"}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {meta?.title ?? item.id}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {meta?.why}
                        </p>
                        <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-ink/80">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
