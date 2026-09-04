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
    progress: string;
    stepServer: string;
    stepSpeed: string;
    stepUi: string;
    groups: Record<CheckGroup, string>;
    checks: Record<string, { title: string; why: string }>;
  }
> = {
  en: {
    kicker: "Live visual tests",
    title: "What this session actually checks",
    lead: "These are not screenshots. Each row runs against the signed-in account, the database, and the paths recruiters care about: sign-in, data security, résumé structure, templates, PDF export, and load speed.",
    localeLabel: "Language",
    passed: "passed",
    failed: "failed",
    rerun: "Run again",
    running: "Running tests…",
    progress: "Progress",
    stepServer: "Sign-in, database, and résumé structure",
    stepSpeed: "Measuring page and route speed",
    stepUi: "Theme and PDF libraries",
    groups: {
      auth: "Sign-in",
      data: "Data and security",
      schema: "Résumé structure",
      export: "PDF export",
      ui: "Interface",
      speed: "Load speed",
    },
    checks: {
      session: {
        title: "Google session is active",
        why: "The person viewing this is a real signed-in user, not a fake account.",
      },
      env: {
        title: "Server keys are loaded",
        why: "Production cannot talk to the database or sign-in without them.",
      },
      profile: {
        title: "Profile row exists",
        why: "Google sign-in creates a profile tied to this account.",
      },
      rlsRead: {
        title: "The CV list is scoped to this user",
        why: "The query only returns rows owned by this account.",
      },
      storedSchema: {
        title: "Saved CVs match the résumé contract",
        why: "The JSON stored in the database still parses as the typed structure.",
      },
      templates: {
        title: "Eleven distinct layouts",
        why: "Each template id is unique and unknown ids fall back to Harvard.",
      },
      factories: {
        title: "Empty and sample CVs are valid",
        why: "Creating a CV and the sample résumé use the same structure.",
      },
      pdfName: {
        title: "The PDF filename is safe",
        why: "Export cleans accents and punctuation before download.",
      },
      pdfLibs: {
        title: "PDF libraries load in the browser",
        why: "The same modules used by Export PDF can be imported here.",
      },
      theme: {
        title: "The theme mark is set",
        why: "Dark mode is stored on the page root, not guessed from CSS.",
      },
      a4: {
        title: "The A4 preview size is fixed",
        why: "The sheet is 794×1123 px so the PDF and the screen match.",
      },
      pageTtfb: {
        title: "Time to first byte",
        why: "How long the server takes to start sending this page.",
      },
      pageLoad: {
        title: "Full page load",
        why: "How long the browser takes to finish loading this document.",
      },
      routeLanding: {
        title: "Home page request",
        why: "A fresh request to the public landing, without cache.",
      },
      routeDashboard: {
        title: "Dashboard request",
        why: "A fresh request to the CV list as this signed-in user.",
      },
      routeTests: {
        title: "This page request",
        why: "A second visit to this page to compare with the first load.",
      },
    },
  },
  es: {
    kicker: "Pruebas visuales en vivo",
    title: "Qué comprueba esta sesión",
    lead: "No son capturas. Cada fila corre contra la cuenta autenticada, la base de datos y lo que importa a un reclutador: acceso, seguridad de datos, estructura del currículum, plantillas, exportar a PDF y velocidad de carga.",
    localeLabel: "Idioma",
    passed: "correctos",
    failed: "fallidos",
    rerun: "Volver a correr",
    running: "Ejecutando las pruebas…",
    progress: "Progreso",
    stepServer: "Acceso, base de datos y estructura del currículum",
    stepSpeed: "Midiendo la velocidad de la página y las rutas",
    stepUi: "Tema y librerías para exportar a PDF",
    groups: {
      auth: "Acceso",
      data: "Datos y seguridad",
      schema: "Estructura del currículum",
      export: "Exportar a PDF",
      ui: "Interfaz",
      speed: "Velocidad de carga",
    },
    checks: {
      session: {
        title: "La sesión de Google está activa",
        why: "Quien mira esto es un usuario real, no una cuenta inventada.",
      },
      env: {
        title: "Las claves del servidor están cargadas",
        why: "Sin ellas producción no habla con la base de datos ni con el acceso.",
      },
      profile: {
        title: "Existe la fila de perfil",
        why: "El acceso con Google crea un perfil ligado a esta cuenta.",
      },
      rlsRead: {
        title: "La lista de currículums es solo de este usuario",
        why: "La consulta solo devuelve filas de esta cuenta.",
      },
      storedSchema: {
        title: "Los currículums guardados cumplen el contrato",
        why: "Los datos guardados en la base siguen coincidiendo con la estructura tipada.",
      },
      templates: {
        title: "Once plantillas distintas",
        why: "Cada identificador es único y uno desconocido cae a Harvard.",
      },
      factories: {
        title: "El currículum vacío y el de ejemplo son válidos",
        why: "Crear un currículum y el ejemplo usan la misma estructura.",
      },
      pdfName: {
        title: "El nombre del PDF es seguro",
        why: "Al exportar se limpian tildes y signos antes de descargar.",
      },
      pdfLibs: {
        title: "Las librerías de PDF cargan en el navegador",
        why: "Se pueden importar los mismos módulos que usa Exportar a PDF.",
      },
      theme: {
        title: "La marca de tema está puesta",
        why: "El modo oscuro está en la raíz de la página, no se adivina por CSS.",
      },
      a4: {
        title: "El tamaño A4 de la vista previa es fijo",
        why: "La hoja mide 794 por 1123 píxeles para que el PDF y la pantalla coincidan.",
      },
      pageTtfb: {
        title: "Tiempo hasta el primer byte",
        why: "Cuánto tarda el servidor en empezar a enviar esta página.",
      },
      pageLoad: {
        title: "Carga completa de la página",
        why: "Cuánto tarda el navegador en terminar de cargar este documento.",
      },
      routeLanding: {
        title: "Petición a la página de inicio",
        why: "Una petición nueva a la portada, sin caché.",
      },
      routeDashboard: {
        title: "Petición al panel",
        why: "Una petición nueva a la lista de currículums con esta sesión.",
      },
      routeTests: {
        title: "Petición a esta página",
        why: "Una segunda visita a esta página para comparar con la primera carga.",
      },
    },
  },
};
