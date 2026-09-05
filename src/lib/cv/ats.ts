import {
  getMeta,
  type AtsIssue,
  type AtsReport,
  type CvData,
} from "@/lib/cv/schema";

const STOP = new Set([
  "para",
  "como",
  "esta",
  "este",
  "estos",
  "estas",
  "desde",
  "donde",
  "tenemos",
  "buscar",
  "buscamos",
  "experiencia",
  "años",
  "ano",
  "anos",
  "equipo",
  "trabajo",
  "empresa",
  "sobre",
  "entre",
  "otros",
  "otras",
  "debe",
  "deben",
  "requisito",
  "requisitos",
  "puesto",
  "cargo",
  "chile",
  "santiago",
]);

const WEAK = /\b(responsable de|me encargué|colaboré|ayudé|participé en)\b/i;
const STRONG =
  /\b(lideré|implementé|reduje|aumenté|migr[eé]|diseñé|automat[eé]|lancé|mejoré|construí)\b/i;

export function extractKeywords(text: string, limit = 16) {
  const counts = new Map<string, number>();

  for (const raw of text.toLowerCase().split(/[^a-záéíóúñü0-9+#.]/i)) {
    const word = raw.trim();
    if (word.length < 4 || STOP.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function cvPlainText(data: CvData) {
  return [
    data.personal.title,
    data.personal.summary,
    data.skills.join(" "),
    ...data.experience.flatMap((item) => [
      item.role,
      item.company,
      ...item.highlights,
    ]),
    ...data.projects.flatMap((item) => [
      item.name,
      item.description,
      item.technologies,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function buildAtsReport(data: CvData, posting = ""): AtsReport {
  const meta = getMeta(data);
  const issues: AtsIssue[] = [];
  const atsNotes: string[] = [];
  const recruiterNotes: string[] = [];
  let score = 38;

  if (data.personal.email.includes("@")) {
    score += 10;
    atsNotes.push("El email está visible: el ATS puede contactarte.");
  } else {
    issues.push({
      severity: "high",
      title: "Falta el email",
      detail: "Sin correo el filtro descarta el CV o el reclutador no escribe.",
    });
  }

  if (data.personal.phone.replace(/\D/g, "").length >= 8) {
    score += 8;
  } else {
    issues.push({
      severity: "high",
      title: "Falta el teléfono",
      detail: "En Chile y Latam casi siempre lo piden en la primera pasada.",
    });
  }

  if (data.personal.location.trim()) {
    score += 6;
  } else {
    issues.push({
      severity: "medium",
      title: "Sin ciudad",
      detail: "Indica ciudad y país. Ej: Valparaíso, Chile.",
    });
  }

  const summary = data.personal.summary.trim();
  if (summary.length >= 80 && summary.length <= 520) {
    score += 8;
  } else if (!summary) {
    issues.push({
      severity: "high",
      title: "Sin perfil profesional",
      detail: "En 7 segundos el reclutador lee nombre, titular y este párrafo.",
    });
  } else {
    issues.push({
      severity: "medium",
      title: "El perfil es corto o muy largo",
      detail: "Apunta a 3 o 4 líneas: quién eres, qué haces y para quién.",
    });
  }

  const jobs = data.experience.filter((item) => item.role || item.company);
  if (jobs.length === 0) {
    issues.push({
      severity: "high",
      title: "Sin experiencia",
      detail: "Añade empleos, freelance o prácticas. El más reciente primero.",
    });
  } else {
    score += 8;
    const dated = jobs.filter((item) => item.startDate || item.current);
    if (dated.length === jobs.length) score += 6;
    else {
      issues.push({
        severity: "medium",
        title: "Fechas incompletas",
        detail: "Los ATS ordenan por fechas. Completa mes y año.",
      });
    }

    const bullets = jobs.flatMap((item) => item.highlights.filter(Boolean));
    if (bullets.length >= jobs.length) score += 8;
    const weak = bullets.filter((line) => WEAK.test(line) && !STRONG.test(line));
    if (weak.length) {
      issues.push({
        severity: "low",
        title: "Viñetas débiles",
        detail: `Cambia “responsable de…” por un verbo + resultado. Ej: “Implementé…”.`,
      });
    }
  }

  if (data.skills.filter(Boolean).length >= 5) score += 6;
  else {
    issues.push({
      severity: "medium",
      title: "Pocas skills",
      detail: "Lista 6–12 herramientas o competencias que el aviso menciona.",
    });
  }

  if (meta.region === "internacional" && meta.includePhoto) {
    score -= 8;
    issues.push({
      severity: "high",
      title: "Quita la foto para EE.UU. / ATS global",
      detail: "En mercados anglosajones la foto puede sesgar o romper el parseo.",
    });
  } else if (
    (meta.region === "cl" || meta.region === "latam") &&
    meta.includePhoto
  ) {
    atsNotes.push(
      "En Chile la foto es opcional. Úsala solo si el rubro lo espera (comercial, cara a público).",
    );
  }

  if (meta.region === "cl" && !meta.rut) {
    recruiterNotes.push(
      "El RUT es opcional en CV FORGE. Algunos avisos locales lo piden; no lo pongas si no hace falta.",
    );
  }

  const haystack = cvPlainText(data);
  const keywords = posting ? extractKeywords(posting) : [];
  const missing = keywords.filter((word) => !haystack.includes(word));
  const matched = keywords.length - missing.length;

  if (keywords.length) {
    score += Math.min(14, matched * 2);
    if (missing.length) {
      issues.push({
        severity: "medium",
        title: "Palabras del aviso que no aparecen",
        detail: `Si las tienes de verdad, encájalas: ${missing.slice(0, 8).join(", ")}.`,
      });
    } else {
      atsNotes.push("El texto cubre las palabras clave del aviso.");
    }
  }

  recruiterNotes.push(
    data.personal.title
      ? `En 7 segundos lee: “${data.personal.fullName || "Tu nombre"} · ${data.personal.title}”.`
      : "Falta un titular. El reclutador no adivina tu oficio.",
  );
  recruiterNotes.push(
    jobs[0]
      ? `El último rol que ve es ${[jobs[0].role, jobs[0].company].filter(Boolean).join(" en ") || "el primero de la lista"}.`
      : "Sin un puesto reciente, el escaneo se corta en el nombre.",
  );
  if (!atsNotes.length) {
    atsNotes.push(
      "Usa una plantilla de una columna (Harvard o Dossier) si vas a un portal con filtro automático.",
    );
  }

  return {
    score: Math.max(12, Math.min(99, score)),
    atsNotes,
    recruiterNotes,
    missingKeywords: missing.slice(0, 12),
    issues,
    updatedAt: new Date().toISOString(),
  };
}
