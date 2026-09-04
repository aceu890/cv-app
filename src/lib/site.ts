export const SITE_NAME = "CV FORGE";

export const SITE_TAGLINE =
  "Creador de currículum gratis, sin publicidad y fácil de usar";

export const SITE_DESCRIPTION =
  "Crea tu currículum, CV u hoja de vida online gratis. Sin fines de lucro, sin anuncios y sin registro obligatorio. Elige una plantilla, edita y descarga un PDF A4 profesional.";

export const SITE_KEYWORDS = [
  "creador de currículum",
  "crear cv online",
  "currículum vitae gratis",
  "cv gratis sin registro",
  "editor de cv",
  "plantillas de currículum",
  "cv pdf",
  "crear hoja de vida",
  "hoja de vida gratis",
  "resume builder free",
  "free cv maker",
  "curriculum vitae",
  "cv sin publicidad",
  "crear currículum sin cuenta",
];

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const netlify = process.env.URL?.replace(/\/$/, "");
  if (netlify?.startsWith("http")) return netlify;

  return "https://cv-forgex.netlify.app";
}
