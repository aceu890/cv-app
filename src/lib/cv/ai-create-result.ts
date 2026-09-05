import type { CvData } from "@/lib/cv/schema";

export type CreateCvFromAiResult =
  | { error: string }
  | { local: true; title: string; data: CvData }
  | { id: string };
