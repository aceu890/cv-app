import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: {
    wrap: "gap-2",
    mark: "size-8 rounded-[0.65rem] text-[0.68rem]",
    word: "text-[0.95rem]",
    gap: "gap-1",
  },
  md: {
    wrap: "gap-2.5",
    mark: "size-9 rounded-[0.7rem] text-[0.72rem]",
    word: "text-[1.05rem]",
    gap: "gap-1.5",
  },
  lg: {
    wrap: "gap-3",
    mark: "size-12 rounded-[0.9rem] text-[0.92rem]",
    word: "text-[1.45rem]",
    gap: "gap-2",
  },
} as const;

export function BrandLogo({ href = "/", size = "md" }: BrandLogoProps) {
  const scale = SIZES[size];

  const mark = (
    <span className={`brand-logo inline-flex items-center ${scale.wrap}`}>
      <span
        className={`brand-mark relative grid shrink-0 place-items-center ${scale.mark}`}
        aria-hidden
      >
        <span className="brand-mark-shine" />
        <span className="relative z-10 font-[family-name:var(--font-display)] font-extrabold tracking-[0.06em] text-[#f7f3ea]">
          CV
        </span>
        <span className="brand-ember" />
      </span>
      <span
        className={`flex items-baseline font-[family-name:var(--font-display)] font-extrabold leading-none ${scale.word} ${scale.gap}`}
      >
        <span className="brand-cv-text">CV</span>
        <span className="tracking-[0.18em] text-ink">FORGE</span>
      </span>
    </span>
  );

  if (!href) {
    return (
      <span className="inline-flex" aria-label="CV FORGE">
        {mark}
      </span>
    );
  }

  return (
    <Link href={href} className="inline-flex shrink-0" aria-label="CV FORGE">
      {mark}
    </Link>
  );
}
