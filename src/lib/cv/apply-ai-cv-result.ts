import type { CreateCvFromAiResult } from "@/lib/cv/ai-create-result";
import { createLocalCv } from "@/lib/cv/local-store";

export function applyAiCvResult(
  result: CreateCvFromAiResult | void,
  router: { push: (href: string) => void },
  onLocalCreated?: () => void,
) {
  if (!result) return "No se pudo crear el currículum.";
  if ("error" in result) return result.error;

  if ("id" in result) {
    router.push(`/cv/${result.id}`);
    return null;
  }

  const cv = createLocalCv(result.title, result.data);
  onLocalCreated?.();
  router.push(`/cv/${cv.id}`);
  return null;
}
