import { completeJson } from "@/lib/cv/ai-generate";
import { buildAtsReport, extractKeywords, cvPlainText } from "@/lib/cv/ats";
import {
  getMeta,
  parseCvData,
  withMeta,
  type CoverLetter,
  type CvData,
  type InterviewKit,
  type JobSource,
} from "@/lib/cv/schema";

function nowIso() {
  return new Date().toISOString();
}

function highlightScore(line: string, keywords: string[]) {
  const lower = line.toLowerCase();
  return keywords.reduce(
    (score, word) => score + (lower.includes(word) ? 1 : 0),
    0,
  );
}

export function tailorCvLocal(
  data: CvData,
  job: {
    title: string;
    company: string;
    source: JobSource;
    posting: string;
    parentId?: string;
    parentTitle?: string;
  },
): CvData {
  const keywords = extractKeywords(job.posting, 20);
  const skills = [...data.skills].sort((left, right) => {
    const a = keywords.some((word) => left.toLowerCase().includes(word))
      ? 1
      : 0;
    const b = keywords.some((word) => right.toLowerCase().includes(word))
      ? 1
      : 0;
    return b - a;
  });

  const experience = data.experience.map((item) => ({
    ...item,
    highlights: [...item.highlights].sort(
      (left, right) =>
        highlightScore(right, keywords) - highlightScore(left, keywords),
    ),
  }));

  const title =
    job.title.trim() ||
    data.personal.title ||
    "Profesional";

  let summary = data.personal.summary;
  if (job.title || job.company) {
    const hook = [job.title, job.company].filter(Boolean).join(" en ");
    if (summary && !summary.toLowerCase().includes(job.title.toLowerCase())) {
      summary = `${summary.replace(/\.$/, "")}. Interés actual: ${hook}.`;
    }
  }

  return withMeta(
    {
      ...data,
      personal: {
        ...data.personal,
        title,
        summary,
      },
      skills,
      experience,
    },
    {
      parentId: job.parentId,
      parentTitle: job.parentTitle,
      targetJob: {
        title: job.title,
        company: job.company,
        source: job.source,
        posting: job.posting,
      },
      atsReport: undefined,
      publicSlug: undefined,
    },
  );
}

export function writeCoverLetterLocal(
  data: CvData,
  job: { title: string; company: string; recipient?: string },
): CoverLetter {
  const meta = getMeta(data);
  const name = data.personal.fullName || "Candidato";
  const role = job.title || data.personal.title || "el puesto";
  const company = job.company || "su empresa";
  const win =
    data.experience[0]?.highlights.find(Boolean) ||
    data.projects[0]?.description ||
    data.personal.summary.split(".")[0] ||
    "experiencia comprobable en el oficio";

  const formal = meta.tone === "formal";
  const greeting = formal
    ? `Estimados ${company}:`
    : `Hola${job.recipient ? ` ${job.recipient}` : ""},`;
  const close = formal
    ? "Quedo atento/a a una conversación.\n\nSaludos cordiales,"
    : "Si les acomoda, conversamos.\n\nGracias,";

  const body = `${greeting}

Me postulo a ${role} en ${company}. ${
    formal
      ? "Adjunto mi currículum con la experiencia más cercana al aviso."
      : "Les dejo el CV con lo que más encaja con lo que piden."
  }

${win}

${close}
${name}
${[data.personal.email, data.personal.phone].filter(Boolean).join(" · ")}`;

  return {
    recipient: job.recipient ?? "",
    company,
    role,
    body: body.trim(),
    updatedAt: nowIso(),
  };
}

export function buildInterviewKitLocal(data: CvData): InterviewKit {
  const job = getMeta(data).targetJob;
  const last = data.experience[0];
  const project = data.projects[0];
  const skill = data.skills[0];

  const items = [
    {
      question: "Cuéntame de ti",
      bullets: [
        data.personal.title || "Oficio en una frase",
        data.personal.summary.split(".")[0] || "Qué problema sueles resolver",
        "Por qué te interesa este tipo de rol ahora",
      ],
    },
    {
      question: job
        ? `¿Por qué ${job.title || "este puesto"}${job.company ? ` en ${job.company}` : ""}?`
        : "¿Por qué este puesto?",
      bullets: [
        "Qué viste en el aviso que sí haces hoy",
        "Un logro que se parece al trabajo del día a día",
        "Qué quieres aprender ahí",
      ],
    },
    {
      question: last
        ? `En ${last.company || "tu último trabajo"}, ¿qué hiciste de punta a punta?`
        : "Describe un trabajo de punta a punta",
      bullets: last?.highlights.filter(Boolean).slice(0, 3).length
        ? last.highlights.filter(Boolean).slice(0, 3)
        : ["Contexto", "Qué hiciste tú", "Resultado"],
    },
    {
      question: "Cuéntame un logro que puedas defender con números o evidencia",
      bullets: [
        last?.highlights.find((line) => /\d/.test(line)) ||
          "Elige una viñeta con resultado",
        "Qué cambió después",
        "Qué parte fue tuya",
      ],
    },
    {
      question: skill
        ? `¿Cómo usas ${skill} en el trabajo real?`
        : "¿Cuál es tu herramienta más fuerte?",
      bullets: [
        "Un caso concreto, no el listado del CV",
        "Límite: qué no haces todavía",
        "Con quién te juntas para resolverlo",
      ],
    },
    {
      question: project
        ? `Háblame de ${project.name || "tu proyecto"}`
        : "Háblame de un proyecto propio",
      bullets: [
        project?.description || "Problema que resolvía",
        project?.technologies || "Stack o método",
        project?.result || "Qué pasó cuando lo usaron",
      ],
    },
    {
      question: "¿Qué se te resiste o qué estás mejorando?",
      bullets: [
        "Elige algo real y acotado",
        "Qué haces para mejorarlo",
        "No listes un defecto que mate el rol",
      ],
    },
    {
      question: "¿Qué nos preguntarías tú?",
      bullets: [
        "Cómo se ve una semana típica",
        "Qué problema quieren resolver este trimestre",
        "Con quién trabajarías al lado",
      ],
    },
  ];

  return { items, updatedAt: nowIso() };
}

export async function tailorCvData(
  data: CvData,
  job: {
    title: string;
    company: string;
    source: JobSource;
    posting: string;
    parentId?: string;
    parentTitle?: string;
  },
): Promise<CvData> {
  const local = tailorCvLocal(data, job);
  const ai = await completeJson(`Eres un redactor de CVs en español. Adapta el currículum al aviso SIN inventar empresas, fechas ni cifras.
Tono: ${getMeta(data).tone}. Región: ${getMeta(data).region}.
Reordena logros y skills. Ajusta titular y perfil al puesto. Si algo no está en el CV, no lo agregues.
Aviso (${job.source}): ${job.title} — ${job.company}
${job.posting.slice(0, 6000)}

CV actual:
${JSON.stringify({
  personal: data.personal,
  experience: data.experience,
  education: data.education,
  skills: data.skills,
  projects: data.projects,
  languages: data.languages,
  certifications: data.certifications,
  template: data.template,
})}

Devuelve el mismo JSON de currículum.`);

  if (!ai) return local;
  return withMeta(parseCvData(ai), {
    ...getMeta(local),
    targetJob: local.meta?.targetJob,
    parentId: job.parentId,
    parentTitle: job.parentTitle,
    publicSlug: undefined,
  });
}

export async function writeCoverLetterData(
  data: CvData,
  job: { title: string; company: string; recipient?: string },
): Promise<CoverLetter> {
  const local = writeCoverLetterLocal(data, job);
  const ai = await completeJson(`Escribe una carta de presentación en español, una página, tono ${getMeta(data).tone}.
No inventes logros. Usa solo el CV y el aviso.
Devuelve JSON: { "recipient": "", "company": "", "role": "", "body": "texto con saltos de línea" }

Puesto: ${job.title}
Empresa: ${job.company}
Destinatario: ${job.recipient || ""}
CV: ${cvPlainText(data).slice(0, 4000)}
Aviso: ${(getMeta(data).targetJob?.posting || "").slice(0, 2500)}`);

  if (!ai || typeof ai !== "object") return local;
  const row = ai as Record<string, unknown>;
  if (typeof row.body !== "string" || row.body.trim().length < 40) return local;
  return {
    recipient: typeof row.recipient === "string" ? row.recipient : local.recipient,
    company: typeof row.company === "string" ? row.company : local.company,
    role: typeof row.role === "string" ? row.role : local.role,
    body: row.body.trim(),
    updatedAt: nowIso(),
  };
}

export async function reviewAtsData(data: CvData, posting = "") {
  const local = buildAtsReport(
    data,
    posting || getMeta(data).targetJob?.posting || "",
  );
  const ai = await completeJson(`Revisa este CV para ATS y para un reclutador humano (7 segundos). Español. Sin paywall, sé directo.
Devuelve JSON:
{ "score": 0-100, "atsNotes": [""], "recruiterNotes": [""], "missingKeywords": [""], "issues": [{ "severity": "high"|"medium"|"low", "title": "", "detail": "" }] }

CV: ${cvPlainText(data).slice(0, 4500)}
Aviso: ${posting.slice(0, 2500)}`);

  if (!ai || typeof ai !== "object") return local;
  const row = ai as Record<string, unknown>;
  const score = typeof row.score === "number" ? row.score : local.score;
  return {
    ...local,
    score: Math.max(0, Math.min(100, Math.round(score))),
    atsNotes: Array.isArray(row.atsNotes)
      ? row.atsNotes.filter((item): item is string => typeof item === "string")
      : local.atsNotes,
    recruiterNotes: Array.isArray(row.recruiterNotes)
      ? row.recruiterNotes.filter((item): item is string => typeof item === "string")
      : local.recruiterNotes,
    missingKeywords: Array.isArray(row.missingKeywords)
      ? row.missingKeywords.filter((item): item is string => typeof item === "string")
      : local.missingKeywords,
    updatedAt: nowIso(),
  };
}

export async function buildInterviewKitData(data: CvData): Promise<InterviewKit> {
  const local = buildInterviewKitLocal(data);
  const ai = await completeJson(`Arma un kit de entrevista en español a partir del CV. 8 preguntas probables y 3 viñetas de respuesta cada una. No inventes cifras.
JSON: { "items": [{ "question": "", "bullets": ["", "", ""] }] }
CV: ${cvPlainText(data).slice(0, 4500)}
Aviso: ${(getMeta(data).targetJob?.posting || "").slice(0, 1500)}`);

  if (!ai || typeof ai !== "object") return local;
  const row = ai as Record<string, unknown>;
  if (!Array.isArray(row.items) || row.items.length < 5) return local;
  return {
    items: row.items.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const entry = item as Record<string, unknown>;
      if (typeof entry.question !== "string") return [];
      return [
        {
          question: entry.question,
          bullets: Array.isArray(entry.bullets)
            ? entry.bullets.filter((line): line is string => typeof line === "string")
            : [],
        },
      ];
    }),
    updatedAt: nowIso(),
  };
}
