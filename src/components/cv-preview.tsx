"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { CvLayout } from "@/components/cv-layouts";
import { formatCvDate, formatCvYear } from "@/lib/cv/dates";
import { A4_HEIGHT_PX, A4_WIDTH_PX } from "@/lib/cv/pdf";
import { getMeta, type CvData } from "@/lib/cv/schema";
import { getTemplate } from "@/lib/cv/templates";

function dateRange(start: string, end: string, current?: boolean) {
  const left = start ? formatCvDate(start) : "";
  const right = current ? "Actual" : end ? formatCvDate(end) : "";
  if (!left && !right) return "";
  if (!right) return left;
  if (!left) return right;
  return `${left} – ${right}`;
}

function educationYear(start: string, end: string) {
  const startYear = start ? formatCvYear(start) : "";
  const endYear = end ? formatCvYear(end) : "";
  if (startYear && endYear && startYear !== endYear) {
    return `${startYear} – ${endYear}`;
  }
  return endYear || startYear;
}

export function CvPreview({
  data,
  title,
  sheetRef,
}: {
  data: CvData;
  title: string;
  sheetRef?: RefObject<HTMLDivElement | null>;
}) {
  const templateMeta = getTemplate(data.template);
  const { personal } = data;
  const meta = getMeta(data);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(A4_HEIGHT_PX);

  const model = {
    name: personal.fullName || title || "Tu nombre",
    title: personal.title,
    contacts: [
      personal.location,
      personal.phone,
      personal.email,
      meta.rut ? `RUT ${meta.rut}` : "",
      personal.linkedin,
      personal.website,
    ].filter(Boolean),
    summary: personal.summary,
    experience: data.experience.map((item) => ({
      id: item.id,
      role: item.role,
      company: item.company,
      location: item.location,
      dates: dateRange(item.startDate, item.endDate, item.current),
      highlights: item.highlights.filter(Boolean),
    })),
    education: data.education.map((item) => ({
      id: item.id,
      degree: item.degree,
      school: item.school,
      location: item.location,
      year: educationYear(item.startDate, item.endDate),
      details: item.details,
    })),
    skills: data.skills.filter(Boolean),
    projects: (data.projects ?? [])
      .filter((item) => item.name || item.description)
      .map((item) => ({
        id: item.id,
        name: item.name,
        bullets: [item.description, item.technologies, item.result].filter(
          Boolean,
        ),
      })),
    languages: data.languages.filter((item) => item.name),
    certifications: data.certifications.filter((item) => item.name),
  };

  useEffect(() => {
    const frame = frameRef.current;
    const sheet = innerRef.current;
    if (!frame || !sheet) return;

    function update() {
      if (!frame || !sheet) return;
      setScale(Math.min(1, frame.clientWidth / A4_WIDTH_PX));
      setSheetHeight(Math.max(A4_HEIGHT_PX, sheet.scrollHeight));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [data]);

  function setRefs(node: HTMLDivElement | null) {
    innerRef.current = node;
    if (sheetRef) {
      sheetRef.current = node;
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">
        Vista previa · {templateMeta.name}
        {data.template === "folio" ? " · ATS" : ""}
      </p>
      <div
        ref={frameRef}
        className="overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgba(28,25,21,0.08)]"
        style={{ height: Math.max(240, sheetHeight * (scale || 0.01)) }}
      >
        <div
          ref={setRefs}
          id="cv-sheet"
          className="cv-sheet origin-top-left overflow-visible"
          style={{
            width: A4_WIDTH_PX,
            minHeight: A4_HEIGHT_PX,
            transform: `scale(${scale || 0.01})`,
          }}
        >
          <CvLayout template={data.template} model={model} />
        </div>
      </div>
    </div>
  );
}
