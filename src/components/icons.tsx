import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "size-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconFile(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.4-3 3.9-4.4 7-4.4s5.6 1.4 7 4.4" />
    </Svg>
  );
}

export function IconFlask(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 3h6M10 3v5.2L5.6 18.2A2 2 0 0 0 7.4 21h9.2a2 2 0 0 0 1.8-2.8L14 8.2V3" />
      <path d="M8.2 14h7.6" />
    </Svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M8 7h8M8 11h8" />
    </Svg>
  );
}

export function IconGift(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M4 14h16M12 10v10M12 10c0-3-4-4-4-1.5S10.5 10 12 10c1.5 0 4-1.2 4-2.5S12 7 12 10z" />
    </Svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 6v6.2c0 4 3 6.6 7 8.3 4-1.7 7-4.3 7-8.3V6z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 3 6 13h6l-1 8 7-10h-6z" />
    </Svg>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 18h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6-1.4A3.8 3.8 0 0 0 7 18z" />
    </Svg>
  );
}

export function IconLetter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="m4 8 8 5 8-5" />
    </Svg>
  );
}

export function IconQr(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <path d="M14 14h3v3h3v3h-6z" />
    </Svg>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V8M3 13h18" />
    </Svg>
  );
}

export function IconSchool(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m3 10 9-6 9 6-9 6z" />
      <path d="M7 12.3V17c0 .8 2.2 3 5 3s5-2.2 5-3v-4.7" />
    </Svg>
  );
}

export function IconTags(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 13.2 12.8 20a2 2 0 0 1-2.8 0L4 14V4h10l6 6.2z" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconAward(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1 7 4.5-2.5 4.5 2.5-1-7" />
    </Svg>
  );
}

export function IconLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M10 9v11" />
    </Svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M4.9 6.2 7.7 9M16.3 15l2.8 2.8M3 12h4M17 12h4M4.9 17.8 7.7 15M16.3 9l2.8-2.8" />
      <circle cx="12" cy="12" r="2.2" />
    </Svg>
  );
}