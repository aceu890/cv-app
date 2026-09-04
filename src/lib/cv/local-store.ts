import { parseCvData, type CvData } from "@/lib/cv/schema";

export const LOCAL_CV_PREFIX = "local-";
export const LOCAL_CVS_KEY = "folio-local-cvs";

export type LocalCv = {
  id: string;
  title: string;
  data: CvData;
  created_at: string;
  updated_at: string;
};

export function isLocalCvId(id: string) {
  return id.startsWith(LOCAL_CV_PREFIX);
}

export function listLocalCvs(): LocalCv[] {
  return readAll().sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at),
  );
}

export function getLocalCv(id: string): LocalCv | null {
  return readAll().find((item) => item.id === id) ?? null;
}

export function createLocalCv(title: string, data: CvData): LocalCv {
  const now = new Date().toISOString();
  const cv: LocalCv = {
    id: `${LOCAL_CV_PREFIX}${crypto.randomUUID()}`,
    title: title.trim() || "Mi CV",
    data,
    created_at: now,
    updated_at: now,
  };
  writeAll([cv, ...readAll()]);
  return cv;
}

export function saveLocalCv(id: string, title: string, data: CvData): LocalCv {
  const now = new Date().toISOString();
  const current = getLocalCv(id);
  const cv: LocalCv = {
    id,
    title: title.trim() || "Mi CV",
    data,
    created_at: current?.created_at ?? now,
    updated_at: now,
  };
  writeAll([cv, ...readAll().filter((item) => item.id !== id)]);
  return cv;
}

export function deleteLocalCv(id: string) {
  writeAll(readAll().filter((item) => item.id !== id));
}

function readAll(): LocalCv[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_CVS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      if (typeof row.id !== "string" || !isLocalCvId(row.id)) return [];
      return [
        {
          id: row.id,
          title: typeof row.title === "string" ? row.title : "Mi CV",
          data: parseCvData(row.data),
          created_at:
            typeof row.created_at === "string"
              ? row.created_at
              : new Date().toISOString(),
          updated_at:
            typeof row.updated_at === "string"
              ? row.updated_at
              : new Date().toISOString(),
        },
      ];
    });
  } catch {
    return [];
  }
}

function writeAll(items: LocalCv[]) {
  window.localStorage.setItem(LOCAL_CVS_KEY, JSON.stringify(items));
}
