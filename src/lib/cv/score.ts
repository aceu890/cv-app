import type { CvData } from "@/lib/cv/schema";

const STRONG =
  /\b(lideré|implementé|reduje|aumenté|migr[eé]|diseñé|automat[eé]|lancé|mejoré|construí|creé|organicé)\b/i;

export function scoreCv(data: CvData) {
  let points = 0;

  if (data.personal.fullName.trim().length > 3) points += 6;
  if (data.personal.title.trim().length > 3) points += 6;
  if (data.personal.email.includes("@")) points += 5;
  if (data.personal.phone.replace(/\D/g, "").length >= 8) points += 4;
  if (data.personal.location.trim()) points += 3;

  const summary = data.personal.summary.trim();
  if (summary.length >= 40) points += 6;
  if (summary.length >= 110) points += 6;
  if (summary.length >= 80 && summary.length <= 540) points += 4;

  const jobs = data.experience.filter((item) => item.role || item.company);
  if (jobs.length) points += 8;
  if (jobs.length >= 2) points += 4;
  if (jobs.length && jobs.every((item) => item.startDate || item.current)) {
    points += 5;
  }
  const bullets = jobs.flatMap((item) => item.highlights.filter(Boolean));
  if (jobs.length && bullets.length >= jobs.length) points += 6;
  if (bullets.some((line) => STRONG.test(line) || /\d/.test(line))) points += 7;

  if (data.education.some((item) => item.school || item.degree)) points += 10;

  const skills = data.skills.filter(Boolean);
  if (skills.length >= 3) points += 5;
  if (skills.length >= 6) points += 5;

  if (data.personal.linkedin.trim() || data.personal.website.trim()) points += 3;
  if (data.projects.some((item) => item.name.trim())) points += 3;
  if (data.languages.some((item) => item.name.trim())) points += 2;
  if (data.certifications.some((item) => item.name.trim())) points += 2;

  return Math.max(1, Math.min(100, points));
}

export function scoreHint(score: number) {
  if (score >= 80) return "Listo para enviar";
  if (score >= 55) return "Buen camino";
  if (score >= 30) return "Falta rellenar";
  return "Recién empieza";
}
