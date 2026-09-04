import type { LocalizedText, VisualCheck } from "@/lib/tests/types";

const TTFB_LIMIT_MS = 500;
const LOAD_LIMIT_MS = 2000;
const ROUTE_LIMITS_MS = {
  routeLanding: 500,
  routeDashboard: 1000,
  routeTests: 2000,
} as const;

function check(
  id: VisualCheck["id"],
  group: VisualCheck["group"],
  ok: boolean,
  detail: LocalizedText,
): VisualCheck {
  return {
    id,
    group,
    status: ok ? "pass" : "fail",
    detail,
  };
}

function roundMs(value: number) {
  return Math.max(0, Math.round(value));
}

function themeLabel(theme: string | null): LocalizedText {
  if (theme === "dark") {
    return { en: "dark", es: "oscuro" };
  }
  if (theme === "light") {
    return { en: "light", es: "claro" };
  }
  return { en: "missing", es: "ausente" };
}

export async function runUiChecks(): Promise<VisualCheck[]> {
  const theme = document.documentElement.getAttribute("data-theme");
  const themeOk = theme === "light" || theme === "dark";
  const label = themeLabel(theme);

  let pdfOk = false;
  let pdfDetail: LocalizedText = {
    en: "The PDF libraries could not be imported.",
    es: "No se pudieron importar las librerías de PDF.",
  };
  try {
    const [{ jsPDF }, canvas] = await Promise.all([
      import("jspdf"),
      import("html2canvas-pro"),
    ]);
    const html2canvas = canvas.default ?? canvas;
    pdfOk = typeof jsPDF === "function" && typeof html2canvas === "function";
    if (pdfOk) {
      pdfDetail = {
        en: "The same modules used by Export PDF load in the browser.",
        es: "Los mismos módulos que usa Exportar a PDF cargan en el navegador.",
      };
    }
  } catch {
    pdfDetail = {
      en: "The browser failed to import the PDF libraries.",
      es: "El navegador no pudo importar las librerías de PDF.",
    };
  }

  return [
    check(
      "theme",
      "ui",
      themeOk,
      themeOk
        ? {
            en: `The page theme is ${label.en}.`,
            es: `El tema de la página es ${label.es}.`,
          }
        : {
            en: "The page root has no light or dark theme mark.",
            es: "La raíz de la página no tiene marca de tema claro u oscuro.",
          },
    ),
    check("pdfLibs", "export", pdfOk, pdfDetail),
  ];
}

export async function runSpeedChecks(
  onRoute?: (done: number, total: number) => void,
): Promise<VisualCheck[]> {
  const nav = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;

  const ttfb = nav ? roundMs(nav.responseStart - nav.requestStart) : 0;
  const ready = nav
    ? roundMs(nav.domContentLoadedEventEnd - nav.startTime)
    : 0;
  const load = nav
    ? roundMs(
        (nav.loadEventEnd > 0 ? nav.loadEventEnd : performance.now()) -
          nav.startTime,
      )
    : 0;

  const routes = [
    { id: "routeLanding" as const, path: "/", en: "Home", es: "Inicio" },
    {
      id: "routeDashboard" as const,
      path: "/dashboard",
      en: "Dashboard",
      es: "Panel",
    },
    {
      id: "routeTests" as const,
      path: "/tests",
      en: "This page",
      es: "Esta página",
    },
  ];

  const routeChecks: VisualCheck[] = [];
  for (const [index, route] of routes.entries()) {
    const started = performance.now();
    try {
      const response = await fetch(route.path, {
        credentials: "same-origin",
        cache: "no-store",
      });
      const ms = roundMs(performance.now() - started);
      const limit = ROUTE_LIMITS_MS[route.id];
      const ok = response.ok && ms <= limit;
      routeChecks.push(
        check(route.id, "speed", ok, {
          en: `${route.en} ${ms} ms · status ${response.status} (limit ${limit} ms).`,
          es: `${route.es} ${ms} milisegundos · estado ${response.status} (límite ${limit} milisegundos).`,
        }),
      );
    } catch {
      routeChecks.push(
        check(route.id, "speed", false, {
          en: `${route.en} could not be measured.`,
          es: `No se pudo medir ${route.es.toLowerCase()}.`,
        }),
      );
    }
    onRoute?.(index + 1, routes.length);
  }

  return [
    check(
      "pageTtfb",
      "speed",
      Boolean(nav) && ttfb <= TTFB_LIMIT_MS,
      nav
        ? {
            en: `First byte ${ttfb} ms · content ready ${ready} ms (limit ${TTFB_LIMIT_MS} ms).`,
            es: `Primer byte ${ttfb} milisegundos · contenido listo ${ready} milisegundos (límite ${TTFB_LIMIT_MS} milisegundos).`,
          }
        : {
            en: "This browser does not expose page timing.",
            es: "Este navegador no expone la medición de carga.",
          },
    ),
    check(
      "pageLoad",
      "speed",
      Boolean(nav) && load <= LOAD_LIMIT_MS,
      nav
        ? {
            en: `Full load ${load} ms (limit ${LOAD_LIMIT_MS} ms).`,
            es: `Carga total ${load} milisegundos (límite ${LOAD_LIMIT_MS} milisegundos).`,
          }
        : {
            en: "The load event could not be read.",
            es: "No se pudo leer el evento de carga.",
          },
    ),
    ...routeChecks,
  ];
}
