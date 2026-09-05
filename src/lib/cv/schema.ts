import type { Json } from "@/lib/supabase/database.types";
import {
  DEFAULT_TEMPLATE,
  parseTemplateId,
  type CvTemplateId,
} from "@/lib/cv/templates";

export type CvExperience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
};

export type CvEducation = {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type CvLanguage = {
  id: string;
  name: string;
  level: string;
};

export type CvCertification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type CvProject = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  result: string;
};

export type CvPersonal = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
};

export type CvRegion = "cl" | "latam" | "es" | "internacional";
export type CvTone = "formal" | "cercano";
export type JobSource = "linkedin" | "computrabajo" | "getonboard" | "otro";

export const CV_REGIONS: { id: CvRegion; label: string }[] = [
  { id: "cl", label: "Chile" },
  { id: "latam", label: "Latinoamérica" },
  { id: "es", label: "España" },
  { id: "internacional", label: "Internacional" },
];

export const CV_TONES: { id: CvTone; label: string }[] = [
  { id: "formal", label: "Formal" },
  { id: "cercano", label: "Cercano" },
];

export const JOB_SOURCES: { id: JobSource; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "computrabajo", label: "Computrabajo" },
  { id: "getonboard", label: "Get on Board" },
  { id: "otro", label: "Otro aviso" },
];

export type CvTargetJob = {
  title: string;
  company: string;
  source: JobSource;
  posting: string;
};

export type CoverLetter = {
  recipient: string;
  company: string;
  role: string;
  body: string;
  updatedAt: string;
};

export type AtsIssue = {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type AtsReport = {
  score: number;
  atsNotes: string[];
  recruiterNotes: string[];
  missingKeywords: string[];
  issues: AtsIssue[];
  updatedAt: string;
};

export type InterviewItem = {
  question: string;
  bullets: string[];
};

export type InterviewKit = {
  items: InterviewItem[];
  updatedAt: string;
};

export type CvDepth = "basico" | "medio" | "pro";

export const CV_DEPTHS: { id: CvDepth; label: string; hint: string }[] = [
  { id: "basico", label: "Básico", hint: "Lo esencial, rápido" },
  { id: "medio", label: "Medio", hint: "CV completo y claro" },
  { id: "pro", label: "Pro", hint: "Todos los extras" },
];

export type CvMeta = {
  region: CvRegion;
  tone: CvTone;
  depth: CvDepth;
  rut: string;
  includePhoto: boolean;
  parentId?: string;
  parentTitle?: string;
  targetJob?: CvTargetJob;
  coverLetter?: CoverLetter;
  atsReport?: AtsReport;
  interviewKit?: InterviewKit;
  publicSlug?: string;
};

export type CvData = {
  template: CvTemplateId;
  personal: CvPersonal;
  experience: CvExperience[];
  education: CvEducation[];
  skills: string[];
  projects: CvProject[];
  languages: CvLanguage[];
  certifications: CvCertification[];
  sourceRevision?: number;
  meta?: CvMeta;
};

export const LANGUAGE_LEVELS = [
  "Nativo",
  "C2",
  "C1",
  "B2",
  "B1",
  "A2",
  "A1",
] as const;

export function createDefaultCvData(
  profile?: {
    full_name?: string | null;
    email?: string | null;
  },
  depth: CvDepth = "medio",
): CvData {
  return {
    template: DEFAULT_TEMPLATE,
    personal: {
      fullName: profile?.full_name ?? "",
      title: "",
      email: profile?.email ?? "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    meta: defaultMeta(depth),
  };
}

export function parseDepth(value: unknown): CvDepth {
  return value === "basico" || value === "pro" ? value : "medio";
}

export function defaultMeta(depth: CvDepth = "medio"): CvMeta {
  return {
    region: "cl",
    tone: "formal",
    depth,
    rut: "",
    includePhoto: false,
  };
}

export function getMeta(data: CvData): CvMeta {
  return { ...defaultMeta(), ...data.meta };
}

export function withMeta(data: CvData, patch: Partial<CvMeta>): CvData {
  return {
    ...data,
    meta: { ...getMeta(data), ...patch },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown) {
  return value === true;
}

function parseHighlights(row: Record<string, unknown>) {
  if (Array.isArray(row.highlights)) {
    return row.highlights.map((item) => asString(item)).filter(Boolean);
  }

  const description = asString(row.description);
  if (!description) return [];

  return description
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function parseCvData(raw: unknown): CvData {
  const root = asRecord(raw);
  const personal = asRecord(root.personal);
  const fallback = createDefaultCvData();

  return {
    template: parseTemplateId(root.template),
    sourceRevision:
      typeof root.sourceRevision === "number" ? root.sourceRevision : 0,
    personal: {
      fullName: asString(personal.fullName) || fallback.personal.fullName,
      title: asString(personal.title),
      email: asString(personal.email) || fallback.personal.email,
      phone: asString(personal.phone),
      location: asString(personal.location),
      website: asString(personal.website),
      linkedin: asString(personal.linkedin),
      summary: asString(personal.summary),
    },
    experience: Array.isArray(root.experience)
      ? root.experience.map((item) => {
          const row = asRecord(item);
          return {
            id: asString(row.id) || crypto.randomUUID(),
            company: asString(row.company),
            role: asString(row.role),
            location: asString(row.location),
            startDate: asString(row.startDate),
            endDate: asString(row.endDate),
            current: asBoolean(row.current),
            highlights: parseHighlights(row),
          };
        })
      : [],
    education: Array.isArray(root.education)
      ? root.education.map((item) => {
          const row = asRecord(item);
          return {
            id: asString(row.id) || crypto.randomUUID(),
            school: asString(row.school),
            degree: asString(row.degree),
            location: asString(row.location),
            startDate: asString(row.startDate),
            endDate: asString(row.endDate),
            details: asString(row.details),
          };
        })
      : [],
    skills: Array.isArray(root.skills)
      ? root.skills.map((skill) => asString(skill)).filter(Boolean)
      : [],
    projects: Array.isArray(root.projects)
      ? root.projects.map((item) => {
          const row = asRecord(item);
          return {
            id: asString(row.id) || crypto.randomUUID(),
            name: asString(row.name),
            description: asString(row.description),
            technologies: asString(row.technologies),
            result: asString(row.result),
          };
        })
      : [],
    languages: Array.isArray(root.languages)
      ? root.languages.map((item) => {
          const row = asRecord(item);
          return {
            id: asString(row.id) || crypto.randomUUID(),
            name: asString(row.name),
            level: asString(row.level),
          };
        })
      : [],
      certifications: Array.isArray(root.certifications)
      ? root.certifications.map((item) => {
          const row = asRecord(item);
          return {
            id: asString(row.id) || crypto.randomUUID(),
            name: asString(row.name),
            issuer: asString(row.issuer),
            year: asString(row.year),
          };
        })
      : [],
    meta: parseMeta(root.meta),
  };
}

function parseRegion(value: unknown): CvRegion {
  return value === "latam" || value === "es" || value === "internacional"
    ? value
    : "cl";
}

function parseTone(value: unknown): CvTone {
  return value === "cercano" ? "cercano" : "formal";
}

function parseSource(value: unknown): JobSource {
  return value === "linkedin" ||
    value === "computrabajo" ||
    value === "getonboard"
    ? value
    : "otro";
}

function parseMeta(raw: unknown): CvMeta {
  const row = asRecord(raw);
  const target = asRecord(row.targetJob);
  const letter = asRecord(row.coverLetter);
  const ats = asRecord(row.atsReport);
  const kit = asRecord(row.interviewKit);

  return {
    region: parseRegion(row.region),
    tone: parseTone(row.tone),
    depth: parseDepth(row.depth),
    rut: asString(row.rut),
    includePhoto: asBoolean(row.includePhoto),
    parentId: asString(row.parentId) || undefined,
    parentTitle: asString(row.parentTitle) || undefined,
    targetJob: asString(target.posting)
      ? {
          title: asString(target.title),
          company: asString(target.company),
          source: parseSource(target.source),
          posting: asString(target.posting),
        }
      : undefined,
    coverLetter: asString(letter.body)
      ? {
          recipient: asString(letter.recipient),
          company: asString(letter.company),
          role: asString(letter.role),
          body: asString(letter.body),
          updatedAt: asString(letter.updatedAt) || new Date().toISOString(),
        }
      : undefined,
    atsReport:
      typeof ats.score === "number"
        ? {
            score: Math.max(0, Math.min(100, Math.round(ats.score))),
            atsNotes: Array.isArray(ats.atsNotes)
              ? ats.atsNotes.map((item) => asString(item)).filter(Boolean)
              : [],
            recruiterNotes: Array.isArray(ats.recruiterNotes)
              ? ats.recruiterNotes.map((item) => asString(item)).filter(Boolean)
              : [],
            missingKeywords: Array.isArray(ats.missingKeywords)
              ? ats.missingKeywords.map((item) => asString(item)).filter(Boolean)
              : [],
            issues: Array.isArray(ats.issues)
              ? ats.issues.flatMap((item) => {
                  const issue = asRecord(item);
                  const title = asString(issue.title);
                  if (!title) return [];
                  return [
                    {
                      severity:
                        issue.severity === "high" || issue.severity === "medium"
                          ? issue.severity
                          : "low",
                      title,
                      detail: asString(issue.detail),
                    },
                  ];
                })
              : [],
            updatedAt: asString(ats.updatedAt) || new Date().toISOString(),
          }
        : undefined,
    interviewKit: Array.isArray(kit.items)
      ? {
          items: kit.items.flatMap((item) => {
            const rowItem = asRecord(item);
            const question = asString(rowItem.question);
            if (!question) return [];
            return [
              {
                question,
                bullets: Array.isArray(rowItem.bullets)
                  ? rowItem.bullets.map((line) => asString(line)).filter(Boolean)
                  : [],
              },
            ];
          }),
          updatedAt: asString(kit.updatedAt) || new Date().toISOString(),
        }
      : undefined,
    publicSlug: asString(row.publicSlug) || undefined,
  };
}

export function cvDataToJson(data: CvData): Json {
  return JSON.parse(JSON.stringify(data)) as Json;
}

export function emptyExperience(): CvExperience {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    highlights: [""],
  };
}

export function emptyEducation(): CvEducation {
  return {
    id: crypto.randomUUID(),
    school: "",
    degree: "",
    location: "",
    startDate: "",
    endDate: "",
    details: "",
  };
}

export function emptyProject(): CvProject {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    technologies: "",
    result: "",
  };
}

export function emptyLanguage(): CvLanguage {
  return {
    id: crypto.randomUUID(),
    name: "",
    level: "C1",
  };
}

export function emptyCertification(): CvCertification {
  return {
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    year: "",
  };
}
