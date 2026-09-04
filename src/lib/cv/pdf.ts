export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export function cvFileName(title: string, fullName: string) {
  const base = (fullName || title || "curriculum")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "curriculum"}.pdf`;
}

export async function exportElementToPdf(
  source: HTMLElement,
  filename: string,
) {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);
  const html2canvas =
    html2canvasModule.default ??
    (html2canvasModule as unknown as typeof html2canvasModule.default);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const parent = source.parentElement;
  const previous = {
    transform: source.style.transform,
    width: source.style.width,
    minHeight: source.style.minHeight,
    height: source.style.height,
    opacity: source.style.opacity,
    overflow: source.style.overflow,
    parentOverflow: parent?.style.overflow ?? "",
    parentHeight: parent?.style.height ?? "",
    theme: document.documentElement.getAttribute("data-theme"),
  };

  source.style.transform = "none";
  source.style.width = `${A4_WIDTH_PX}px`;
  source.style.minHeight = `${A4_HEIGHT_PX}px`;
  source.style.height = "auto";
  source.style.opacity = "1";
  source.style.overflow = "visible";
  if (parent) {
    parent.style.overflow = "visible";
    parent.style.height = "auto";
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    const canvas = await html2canvas(source, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      foreignObjectRendering: false,
      width: A4_WIDTH_PX,
      height: Math.max(source.scrollHeight, A4_HEIGHT_PX),
      windowWidth: A4_WIDTH_PX,
      windowHeight: Math.max(source.scrollHeight, A4_HEIGHT_PX),
      onclone(clonedDoc, element) {
        clonedDoc.documentElement.setAttribute("data-theme", "light");
        clonedDoc.documentElement.style.colorScheme = "light";
        clonedDoc.body.style.background = "#ffffff";
        clonedDoc.body.style.color = "#111111";

        element.style.transform = "none";
        element.style.opacity = "1";
        element.style.visibility = "visible";
        element.style.overflow = "visible";
        element.style.width = `${A4_WIDTH_PX}px`;
        element.style.minHeight = `${A4_HEIGHT_PX}px`;
        element.style.height = "auto";
        element.style.background = "#ffffff";
        element.style.color = "#111111";

        const sheet = clonedDoc.getElementById("cv-sheet");
        if (sheet && sheet !== element) {
          sheet.style.transform = "none";
          sheet.style.opacity = "1";
          sheet.style.minHeight = `${A4_HEIGHT_PX}px`;
          sheet.style.overflow = "visible";
        }

        clonedDoc.querySelectorAll<HTMLElement>(".cv-page").forEach((page) => {
          page.style.minHeight = `${A4_HEIGHT_PX}px`;
          page.style.overflow = "visible";
        });
      },
    });

    if (canvas.width < 2 || canvas.height < 2) {
      throw new Error("La captura del CV quedó vacía.");
    }

    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;

    // One full A4 page when the CV fits or only overflows a little.
    // Avoids slicing through lines; the template background already fills the sheet.
    if (imageHeight <= pageHeight * 1.18) {
      const fits = imageHeight <= pageHeight + 0.6;
      const drawWidth = fits ? pageWidth : pageWidth * (pageHeight / imageHeight);
      const drawHeight = fits ? pageHeight : pageHeight;
      const x = (pageWidth - drawWidth) / 2;
      pdf.addImage(image, "PNG", x, 0, drawWidth, drawHeight);
      pdf.save(filename);
      return;
    }

    let remaining = imageHeight;
    let offset = 0;

    pdf.addImage(image, "PNG", 0, offset, pageWidth, imageHeight);
    remaining -= pageHeight;

    while (remaining > 2) {
      offset -= pageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, offset, pageWidth, imageHeight);
      remaining -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    source.style.transform = previous.transform;
    source.style.width = previous.width;
    source.style.minHeight = previous.minHeight;
    source.style.height = previous.height;
    source.style.opacity = previous.opacity;
    source.style.overflow = previous.overflow;
    if (parent) {
      parent.style.overflow = previous.parentOverflow;
      parent.style.height = previous.parentHeight;
    }
    if (previous.theme) {
      document.documentElement.setAttribute("data-theme", previous.theme);
    }
  }
}
