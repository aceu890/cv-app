"use client";

import { useEffect, useMemo, useState } from "react";
import { rerunVisualChecks } from "@/lib/actions/tests";
import { TEST_COPY } from "@/lib/tests/copy";
import { runSpeedChecks, runUiChecks } from "@/lib/tests/run-client";
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
  "speed",
];

type VisualTestsProps = {
  initial: VisualCheck[];
};

export function VisualTests({ initial }: VisualTestsProps) {
  const [locale, setLocale] = useState<TestLocale>("en");
  const [server, setServer] = useState(initial);
  const [extra, setExtra] = useState<VisualCheck[] | null>(null);
  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(8);
  const [step, setStep] = useState<"server" | "speed" | "ui">("server");

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
    setServer(initial);
    void runSuite(initial);
  }, [initial]);

  async function runSuite(serverChecks: VisualCheck[]) {
    setRunning(true);
    setProgress(12);
    setStep("server");
    setExtra(null);
    setServer(serverChecks);

    setProgress(28);
    setStep("speed");
    const speed = await runSpeedChecks((done, total) => {
      setProgress(28 + Math.round((done / total) * 44));
    });

    setProgress(78);
    setStep("ui");
    const ui = await runUiChecks();

    setExtra([...ui, ...speed]);
    setProgress(100);
    setRunning(false);
  }

  async function rerun() {
    setRunning(true);
    setProgress(6);
    setStep("server");
    setExtra(null);
    const nextServer = await rerunVisualChecks();
    setServer(nextServer);
    await runSuite(nextServer);
  }

  function changeLocale(next: TestLocale) {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const checks = useMemo(() => [...server, ...(extra ?? [])], [server, extra]);
  const passed = checks.filter((item) => item.status === "pass").length;
  const failed = checks.filter((item) => item.status === "fail").length;
  const copy = TEST_COPY[locale];
  const stepLabel =
    step === "server"
      ? copy.stepServer
      : step === "speed"
        ? copy.stepSpeed
        : copy.stepUi;

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
                  ? "bg-solid text-on-solid"
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
              <span className="ml-2">/ {checks.length}</span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => void rerun()}
          disabled={running}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copy.rerun}
        </button>
      </div>

      <div className="mt-4">
        <div
          className="h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={copy.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {running ? (
          <p className="mt-2 text-xs text-muted">
            {progress}% · {stepLabel}
          </p>
        ) : null}
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
                        <p className="font-medium">{meta?.title ?? item.id}</p>
                        <p className="mt-1 text-sm text-muted">{meta?.why}</p>
                        <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-ink/80">
                          {item.detail[locale]}
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
