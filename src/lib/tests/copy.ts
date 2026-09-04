import type { CheckGroup, TestLocale } from "@/lib/tests/types";

export const TEST_COPY: Record<
  TestLocale,
  {
    kicker: string;
    title: string;
    lead: string;
    localeLabel: string;
    passed: string;
    failed: string;
    rerun: string;
    running: string;
    groups: Record<CheckGroup, string>;
    checks: Record<string, { title: string; why: string }>;
  }
> = {
  en: {
    kicker: "Live visual tests",
    title: "What this session actually checks",
    lead: "These are not screenshots. Each row runs against the signed-in account, the database, and the same code paths recruiters care about: auth, RLS, CV schema, templates, and PDF.",
    localeLabel: "Language",
    passed: "passed",
    failed: "failed",
    rerun: "Run again",
    running: "Running checks…",
    groups: {
      auth: "Authentication",
      data: "Data and security",
      schema: "CV contract",
      export: "PDF export",
      ui: "Interface",
    },
    checks: {
      session: {
        title: "Google session is active",
        why: "The tester is a real signed-in user, not a mock.",
      },
      env: {
        title: "Supabase keys are loaded",
        why: "Production cannot talk to Postgres or Auth without them.",
      },
      profile: {
        title: "Profile row exists",
        why: "OAuth creates a profiles record tied to the Google account.",
      },
      rlsRead: {
        title: "CV list respects RLS",
        why: "The query only returns rows owned by this user.",
      },
      storedSchema: {
        title: "Saved CVs match CvData",
        why: "JSONB in the database still parses as the typed contract.",
      },
      templates: {
        title: "Eleven distinct layouts",
        why: "Each template id is unique and unknown ids fall back to Harvard.",
      },
      factories: {
        title: "Empty and example CVs are valid",
        why: "Create-CV and the sample résumé use the same schema.",
      },
      pdfName: {
        title: "PDF filename is safe",
        why: "Export sanitizes accents and punctuation before download.",
      },
      pdfLibs: {
        title: "jsPDF and html2canvas load",
        why: "The browser can import the same modules the export button uses.",
      },
      theme: {
        title: "Theme token is set",
        why: "Dark mode is data-theme on <html>, not a CSS-only guess.",
      },
      a4: {
        title: "A4 preview size is fixed",
        why: "The sheet is 794×1123 px so PDF and screen match.",
      },
    },
  },
  es: {
    kicker: "Tests visuales en vivo",
    title: "Qué comprueba esta sesión",
    lead: "No son capturas. Cada fila corre contra la cuenta autenticada, la base de datos y los mismos caminos que importan a un reclutador: auth, RLS, esquema del CV, plantillas y PDF.",
    localeLabel: "Idioma",
    passed: "ok",
    failed: "falla",
    rerun: "Volver a correr",
    running: "Ejecutando checks…",
    groups: {
      auth: "Autenticación",
      data: "Datos y seguridad",
      schema: "Contrato del CV",
      export: "Exportar PDF",
      ui: "Interfaz",
    },
    checks: {
      session: {
        title: "La sesión de Google está activa",
        why: "Quien mira esto es un usuario real, no un mock.",
      },
      env: {
        title: "Las claves de Supabase están cargadas",
        why: "Sin ellas producción no habla con Postgres ni Auth.",
      },
      profile: {
        title: "Existe la fila de perfil",
        why: "OAuth crea un registro en profiles ligado a Google.",
      },
      rlsRead: {
        title: "La lista de CVs respeta RLS",
        why: "La consulta solo devuelve filas de este usuario.",
      },
      storedSchema: {
        title: "Los CVs guardados cumplen CvData",
        why: "El JSONB de la base sigue parseando al contrato tipado.",
      },
      templates: {
        title: "Once layouts distintos",
        why: "Cada id es único y un id desconocido cae a Harvard.",
      },
      factories: {
        title: "CV vacío y de ejemplo son válidos",
        why: "Crear CV y el ejemplo usan el mismo esquema.",
      },
      pdfName: {
        title: "El nombre del PDF es seguro",
        why: "Exportar limpia tildes y signos antes de descargar.",
      },
      pdfLibs: {
        title: "jsPDF y html2canvas cargan",
        why: "El navegador importa los mismos módulos del botón Exportar.",
      },
      theme: {
        title: "El token de tema está puesto",
        why: "El modo oscuro es data-theme en <html>, no un guess de CSS.",
      },
      a4: {
        title: "El A4 tiene tamaño fijo",
        why: "La hoja es 794×1123 px para que PDF y pantalla coincidan.",
      },
    },
  },
};
