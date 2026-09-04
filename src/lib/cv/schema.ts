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

export function createDefaultCvData(profile?: {
  full_name?: string | null;
  email?: string | null;
}): CvData {
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
