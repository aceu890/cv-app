import type { VisualCheck } from "@/lib/tests/types";

function check(
  id: VisualCheck["id"],
  group: VisualCheck["group"],
  ok: boolean,
  pass: string,
  fail: string,
): VisualCheck {
  return {
    id,
    group,
    status: ok ? "pass" : "fail",
    detail: ok ? pass : fail,
  };
}

export async function runClientChecks(): Promise<VisualCheck[]> {
  const theme = document.documentElement.getAttribute("data-theme");
  const themeOk = theme === "light" || theme === "dark";

  let pdfOk = false;
  let pdfDetail = "No se pudieron importar jsPDF o html2canvas-pro.";
  try {
    const [{ jsPDF }, canvas] = await Promise.all([
      import("jspdf"),
      import("html2canvas-pro"),
    ]);
    const html2canvas = canvas.default ?? canvas;
    pdfOk = typeof jsPDF === "function" && typeof html2canvas === "function";
    pdfDetail = pdfOk
      ? "Los mismos módulos que usa Exportar PDF cargan en el navegador."
      : pdfDetail;
  } catch (error) {
    pdfDetail =
      error instanceof Error ? error.message : "Fallo al importar las librerías PDF.";
  }

  return [
    check(
      "theme",
      "ui",
      themeOk,
      `document.documentElement[data-theme] = ${theme}.`,
      "html no tiene data-theme light|dark.",
    ),
    check("pdfLibs", "export", pdfOk, pdfDetail, pdfDetail),
  ];
}
