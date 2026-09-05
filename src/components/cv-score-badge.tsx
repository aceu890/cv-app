import { scoreHint } from "@/lib/cv/score";

export function CvScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const label = scoreHint(score);
  const tone =
    score >= 80 ? "text-accent" : score >= 55 ? "text-ink" : "text-danger";

  return (
    <div
      className={`rounded-2xl border border-line bg-cream/90 ${
        size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
      title={label}
    >
      <p className={`font-serif tabular-nums leading-none ${tone} ${
        size === "sm" ? "text-lg" : "text-2xl"
      }`}>
        {score}
        <span className="ml-0.5 text-xs font-sans text-muted">%</span>
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-accent" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
