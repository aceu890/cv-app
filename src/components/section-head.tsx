import type { ReactNode } from "react";

export function SectionHead({
  title,
  hint,
  icon,
  action,
}: {
  title: string;
  hint: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="font-serif text-2xl leading-tight">{title}</h2>
          <p className="mt-1 text-sm leading-snug text-muted">{hint}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
