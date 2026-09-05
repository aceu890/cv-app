import {
  parseCvData,
  type CvData,
  type CvEducation,
  type CvExperience,
  type CvProject,
} from "@/lib/cv/schema";

const TECH = [
  "React",
  "TypeScript",
  "JavaScript",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "Spring Boot",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "WordPress",
  "Shopify",
  "HTML",
  "CSS",
  "Tailwind",
  "Git",
  "GitHub",
  "Docker",
  "API REST",
  "Supabase",
  "Firebase",
  "MongoDB",
  "PHP",
  "Laravel",
  "Astro",
  "React Native",
];

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("La IA no devolvió un currículum válido.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function withIds(data: CvData): CvData {
  return {
    ...data,
    template: "dossier",
    personal: data.personal,
    experience: data.experience.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    })),
    education: data.education.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    })),
    projects: data.projects.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    })),
    languages: data.languages.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    })),
    certifications: data.certifications.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    })),
  };
}

function buildPrompt(
  context: string,
  profile: { full_name?: string | null; email?: string | null },
) {
  return `Eres un redactor de CVs para reclutadores. Convierte el texto del candidato en un currículum en español, tono profesional, sin inventar empresas, fechas, títulos ni cifras.

Si falta un dato, déjalo vacío. No uses porcentajes ni métricas que no estén en el texto.
El template SIEMPRE debe ser "dossier".
Fechas en YYYY-MM-DD. Si el cargo es actual, current=true y endDate="".
highlights: viñetas de logro (verbo + qué hizo + para qué), 1 a 4 por empleo.
summary: 3 o 4 líneas, orientado al puesto.
skills: solo tecnologías o herramientas mencionadas o claramente implícitas.

Perfil de la cuenta (úsalo si el texto no trae nombre o email):
nombre: ${profile.full_name || ""}
email: ${profile.email || ""}

Texto del candidato:
${context}

Devuelve SOLO un JSON con esta forma:
{
  "template": "dossier",
  "personal": {
    "fullName": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "summary": ""
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "highlights": [""]
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "details": ""
    }
  ],
  "skills": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": "",
      "result": ""
    }
  ],
  "languages": [{ "name": "", "level": "" }],
  "certifications": [{ "name": "", "issuer": "", "year": "" }]
}`;
}

async function generateWithGemini(
  prompt: string,
  apiKey: string,
): Promise<unknown> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError = "Gemini no respondió.";

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      lastError = `Gemini (${model}): ${response.status}`;
      continue;
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return extractJson(text);
    }
  }

  throw new Error(lastError);
}

async function generateWithOpenAi(
  prompt: string,
  apiKey: string,
): Promise<unknown> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Devuelves solo JSON válido de un currículum.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI: ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI no devolvió contenido.");
  }
  return extractJson(text);
}

function localGenerate(
  context: string,
  profile: { full_name?: string | null; email?: string | null },
): CvData {
  const email =
    context.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ??
    profile.email ??
    "";
  const phone =
    context.match(/(?:\+?\s*56\s*)?(?:9\s*)?\d{4}[\s.-]?\d{4}/)?.[0]?.trim() ??
    "";
  const linkedin =
    context.match(/linkedin\.com\/in\/[^\s)]+/i)?.[0]?.replace(/[.,;]$/, "") ??
    "";
  const website =
    context.match(/github\.com\/[^\s)]+/i)?.[0]?.replace(/[.,;]$/, "") ?? "";
  const locationMatch = context.match(
    /(?:Valpara[ií]so|Santiago|Chile|Melipilla|Regi[oó]n de [^,\n]+)/i,
  );

  const lines = context
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*▸]\s*/, "").trim())
    .filter(Boolean);

  const nameLine =
    lines.find(
      (line) =>
        line.length < 60 &&
        /[A-ZÁÉÍÓÚÑ]/.test(line) &&
        !line.includes("@") &&
        !/desarrollador|programador|experiencia|educaci/i.test(line),
    ) ?? "";

  const titleLine =
    lines.find((line) =>
      /desarrollador|programador|full[-\s]?stack|ingenier|diseñador/i.test(
        line,
      ),
    ) ?? "";

  const skills = TECH.filter((item) =>
    new RegExp(item.replace(".", "\\."), "i").test(context),
  );

  const experience: CvExperience[] = [];
  let current: CvExperience | null = null;

  for (const line of lines) {
    const dated = line.match(
      /(20\d{2}|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i,
    );
    const looksLikeJob =
      dated &&
      /freelance|independiente|desarrollador|empresa|inbox|bycore|agro|coca|phone|spa|ltda/i.test(
        line,
      );

    if (looksLikeJob || (dated && /[-–—]|actual/i.test(line) && line.length < 120)) {
      if (current) experience.push(current);
      current = {
        id: crypto.randomUUID(),
        company: line.replace(/\s{2,}/g, " ").slice(0, 80),
        role: titleLine.replace(/[-–].*$/, "").trim() || "Desarrollador",
        location: locationMatch?.[0] ?? "Chile",
        startDate: "",
        endDate: "",
        current: /actual|presente|hoy/i.test(line),
        highlights: [],
      };
      continue;
    }

    if (current && line.length > 28 && !line.includes("@")) {
      current.highlights.push(line);
    }
  }
  if (current) experience.push(current);

  const education: CvEducation[] = [];
  const eduLine = lines.find((line) =>
    /aiep|universi|instituto|bootcamp|udemy|titul/i.test(line),
  );
  if (eduLine) {
    education.push({
      id: crypto.randomUUID(),
      school: /aiep/i.test(eduLine) ? "AIEP" : eduLine.slice(0, 80),
      degree: /programador|computacional|full/i.test(context)
        ? "Programador Computacional"
        : eduLine,
      location: locationMatch?.[0] ?? "",
      startDate: "",
      endDate: "",
      details: eduLine,
    });
  }

  const projects: CvProject[] = [];
  const projectHint = lines.find((line) =>
    /proyecto|portfolio|portafolio|app |sitio |tienda /i.test(line),
  );
  if (projectHint) {
    projects.push({
      id: crypto.randomUUID(),
      name: projectHint.slice(0, 80),
      description: projectHint,
      technologies: skills.slice(0, 5).join(", "),
      result: "",
    });
  }

  const prose = lines
    .filter((line) => line.length > 80)
    .slice(0, 2)
    .join(" ");

  return withIds(
    parseCvData({
      template: "dossier",
      personal: {
        fullName: profile.full_name || nameLine,
        title:
          titleLine
            .replace(/[-–|].*$/, "")
            .replace(/programador computacional/i, "Desarrollador Full-Stack")
            .trim() || "Desarrollador Full-Stack",
        email,
        phone,
        location: locationMatch?.[0] ?? "",
        website,
        linkedin,
        summary:
          prose.slice(0, 520) ||
          `${profile.full_name || nameLine || "Profesional"} busca un rol donde aporte experiencia en desarrollo y entrega de productos digitales.`,
      },
      experience: experience.slice(0, 6),
      education,
      skills,
      projects,
      languages: [{ name: "Español", level: "Nativo" }],
      certifications: [],
    }),
  );
}

export async function generateDossierCv(
  context: string,
  profile: { full_name?: string | null; email?: string | null },
): Promise<CvData> {
  const prompt = buildPrompt(context, profile);
  const geminiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  try {
    if (geminiKey) {
      return withIds(parseCvData(await generateWithGemini(prompt, geminiKey)));
    }
    if (openAiKey) {
      return withIds(parseCvData(await generateWithOpenAi(prompt, openAiKey)));
    }
  } catch (error) {
    console.error("IA del CV:", error);
  }

  return localGenerate(context, profile);
}

export async function completeJson(prompt: string): Promise<unknown | null> {
  const geminiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  try {
    if (geminiKey) return await generateWithGemini(prompt, geminiKey);
    if (openAiKey) return await generateWithOpenAi(prompt, openAiKey);
  } catch (error) {
    console.error("IA JSON:", error);
  }

  return null;
}

export async function generateDossierCvFromPdf(
  base64: string,
  profile: { full_name?: string | null; email?: string | null },
): Promise<CvData> {
  const geminiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!geminiKey) {
    throw new Error(
      "Este PDF parece una imagen. Exporta uno con texto seleccionable o pega el contenido.",
    );
  }

  const data = base64.includes(",")
    ? base64.slice(base64.indexOf(",") + 1).replace(/\s/g, "")
    : base64.replace(/\s/g, "");
  const prompt = buildPrompt(
    "El currículum está en el PDF adjunto. Extrae solo lo que esté escrito.",
    profile,
  );
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
  let lastError = "No se pudo leer el PDF.";

  const attachments = [
    { inlineData: { mimeType: "application/pdf", data } },
    { inline_data: { mime_type: "application/pdf", data } },
  ];

  for (const model of models) {
    for (const attachment of attachments) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }, attachment],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        lastError = `Gemini (${model}): ${response.status}`;
        continue;
      }

      const payload = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return withIds(parseCvData(extractJson(text)));
      }
    }
  }

  throw new Error(lastError);
}

export function cvTitleFromData(data: CvData) {
  const name = data.personal.fullName.split(" ").slice(0, 2).join(" ");
  const role = data.personal.title;
  const title = [name, role].filter(Boolean).join(" · ");
  return title.slice(0, 80) || "CV Dossier";
}
