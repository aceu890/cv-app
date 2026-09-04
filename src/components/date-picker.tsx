"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  WEEKDAYS,
  formatPickerDate,
  getMonthGrid,
  isSameDay,
  parseIsoDate,
  toIsoDate,
} from "@/lib/cv/dates";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "Elegir fecha",
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const [view, setView] = useState(() => {
    const initial = selected ?? new Date();
    return { year: initial.getFullYear(), month: initial.getMonth() };
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, index) => currentYear + 1 - index);
  }, []);

  const cells = getMonthGrid(view.year, view.month);
  const today = new Date();
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
  }).format(new Date(view.year, view.month, 1));

  function shiftMonth(delta: number) {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          const next = parseIsoDate(value) ?? new Date();
          setView({ year: next.getFullYear(), month: next.getMonth() });
          setOpen(true);
        }}
        className="field flex items-center justify-between text-left disabled:bg-line/40"
      >
        <span className={value ? "text-ink" : "text-muted"}>
          {disabled
            ? "Actual"
            : value
              ? formatPickerDate(value)
              : placeholder}
        </span>
        <CalendarIcon />
      </button>
      {open && !disabled ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/40 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 bottom-4 z-50 w-auto rounded-2xl border border-line bg-field p-4 shadow-lg sm:absolute sm:inset-auto sm:z-30 sm:mt-2 sm:w-[18.5rem] sm:rounded-xl sm:p-3 sm:shadow-none">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-muted hover:bg-cream hover:text-ink"
              onClick={() => shiftMonth(-1)}
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium capitalize">{monthLabel}</p>
              <select
                value={view.year}
                onChange={(event) =>
                  setView((current) => ({
                    ...current,
                    year: Number(event.target.value),
                  }))
                }
                className="rounded-md border border-line bg-cream px-1.5 py-1 text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-muted hover:bg-cream hover:text-ink"
              onClick={() => shiftMonth(1)}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[11px] font-medium tracking-wide text-muted"
              >
                {day}
              </span>
            ))}
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }

              const date = new Date(view.year, view.month, day);
              const iso = toIsoDate(date);
              const isSelected = selected ? isSameDay(date, selected) : false;
              const isToday = isSameDay(date, today);

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-11 rounded-md text-sm sm:h-8 ${
                    isSelected
                      ? "bg-accent text-on-accent"
                      : isToday
                        ? "text-accent hover:bg-cream"
                        : "text-ink hover:bg-cream"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="text-xs text-muted hover:text-ink"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Quitar fecha
            </button>
          </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}
