"use client";

import { CvPreview } from "@/components/cv-preview";
import type { CvData } from "@/lib/cv/schema";

export function PublicCvView({ title, data }: { title: string; data: CvData }) {
  return <CvPreview title={title} data={data} />;
}
