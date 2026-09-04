export type DocLocale = "en" | "es";

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "note"; text: string };

export type DocSection = {
  id: string;
  title: string;
  blocks: DocBlock[];
};

export type DocCopy = {
  kicker: string;
  title: string;
  lead: string;
  localeLabel: string;
  toc: string;
  repo: string;
  sections: DocSection[];
};

export const DOC_COPY: Record<DocLocale, DocCopy> = {
  en: {
    kicker: "Technical documentation",
    title: "How Folio is built",
    lead: "A cloud résumé editor with Google sign-in, ten layouts, and A4 PDF export. This page is the product brief for recruiters and engineers reviewing the stack.",
    localeLabel: "English",
    toc: "On this page",
    repo: "Source files also live in README.md and docs/ARCHITECTURE.md.",
    sections: [
      {
        id: "overview",
        title: "Overview",
        blocks: [
          {
            type: "p",
            text: "Folio is a full-stack web product: authenticated users create private CVs, switch templates, and export a PDF that matches the preview. There is no public résumé sharing and no admin panel. One account owns many documents.",
          },
          {
            type: "table",
            headers: ["Topic", "Choice"],
            rows: [
              ["Product", "SaaS-style CV editor"],
              ["Audience", "Signed-in users only"],
              ["Auth", "Google OAuth 2.0 via Supabase"],
              ["Data", "PostgreSQL + RLS; CV stored as JSONB"],
              ["PDF", "Client-side html2canvas-pro + jsPDF"],
            ],
          },
        ],
      },
      {
        id: "stack",
        title: "Technology stack",
        blocks: [
          {
            type: "table",
            headers: ["Layer", "Technology", "Why it is here"],
            rows: [
              [
                "Framework",
                "Next.js 16 (App Router)",
                "Routes, Server Components, Server Actions, session proxy",
              ],
              ["UI", "React 19", "Editor, live preview, ten layouts, theme"],
              [
                "Language",
                "TypeScript 5",
                "CvData contract, typed Supabase client",
              ],
              [
                "Styles",
                "Tailwind CSS 4",
                "Theme tokens, A4 sheets, dark mode",
              ],
              [
                "BaaS",
                "Supabase",
                "Postgres, Auth, Row Level Security",
              ],
              [
                "Auth client",
                "@supabase/ssr",
                "Cookie session on browser and server",
              ],
              [
                "PDF",
                "jsPDF + html2canvas-pro",
                "A4 capture from the on-screen sheet",
              ],
              ["Lint", "ESLint + eslint-config-next", "Next and TypeScript rules"],
            ],
          },
          {
            type: "note",
            text: "There is no custom REST API and no ORM. Next.js talks to Supabase. Create, delete, and profile updates run as Server Actions.",
          },
        ],
      },
      {
        id: "flow",
        title: "How it works",
        blocks: [
          {
            type: "ol",
            items: [
              "The user signs in with Google. Supabase returns to /auth/callback with an authorization code.",
              "The server exchanges the code for a session (httpOnly cookies) and creates a profile plus a first CV if needed.",
              "src/proxy.ts refreshes the session on every request and blocks /dashboard, /cv, /docs, and /profile when there is no user.",
              "The editor writes typed JSON to cvs.data. RLS stops any other account from reading or writing those rows.",
              "The preview maps CvData to a view model and renders one of ten A4 layouts (794×1123 px).",
              "Export clones that sheet, forces light theme, and writes an A4 PDF in the browser.",
            ],
          },
          {
            type: "code",
            text: "Browser → Next.js proxy + Server Actions → Supabase Auth / Postgres\nEditor (client) → supabase.from(\"cvs\").update → RLS\nPDF export → html2canvas-pro + jsPDF (client only)",
          },
        ],
      },
      {
        id: "data",
        title: "Data model",
        blocks: [
          {
            type: "p",
            text: "Two public tables, defined in supabase/schema.sql. auth.users is 1:1 with profiles; each profile owns many cvs.",
          },
          {
            type: "table",
            headers: ["Table", "Role"],
            rows: [
              [
                "profiles",
                "id = auth.users.id. Email, full name, Google avatar.",
              ],
              [
                "cvs",
                "title + data (JSONB). data holds template, personal, experience, education, skills, projects, languages, certifications.",
              ],
            ],
          },
          {
            type: "p",
            text: "A trigger (handle_new_user) and ensureUserWorkspace() both bootstrap the first profile and CV so a failed trigger never leaves an empty account.",
          },
          {
            type: "note",
            text: "JSONB is intentional. A résumé is a form document that changes shape (sections, template, seed revision). A table per bullet would add joins without useful queries. TypeScript parseCvData / cvDataToJson is the contract.",
          },
        ],
      },
      {
        id: "security",
        title: "Security",
        blocks: [
          {
            type: "ul",
            items: [
              "Row Level Security on profiles and cvs: only auth.uid() can select, insert, update, or delete their rows.",
              "Server Actions call getUser() again and filter by user_id.",
              "Google Client Secret stays in the Supabase dashboard, never in the repo.",
              ".env files are gitignored; only .env.example is committed.",
              "PDF generation stays in the browser. CV content is not sent to a third-party print API.",
            ],
          },
        ],
      },
      {
        id: "product",
        title: "Product surface",
        blocks: [
          {
            type: "table",
            headers: ["Route", "Access", "Purpose"],
            rows: [
              ["/", "Public", "Landing"],
              ["/login", "Public", "Google sign-in"],
              ["/auth/callback", "OAuth", "Code → session"],
              ["/dashboard", "Private", "CV list"],
              ["/cv/[id]", "Private", "Editor and A4 preview"],
              ["/docs", "Private", "This documentation"],
              ["/profile", "Private", "Display name"],
            ],
          },
          {
            type: "ul",
            items: [
              "Ten layouts with different structure (Harvard ATS, consulting, sidebar, two columns, and others).",
              "Harvard is one column, no photo or icons, achievement bullets — ATS-friendly.",
              "Dark mode via data-theme and localStorage, without a flash on load. The CV sheet stays light for print.",
              "Responsive editor: edit / preview tabs on mobile.",
            ],
          },
        ],
      },
      {
        id: "decisions",
        title: "Decisions and next steps",
        blocks: [
          {
            type: "ul",
            items: [
              "App Router + Server Actions instead of a custom REST API.",
              "Supabase instead of Auth.js + Prisma + hosted Postgres — OAuth, RLS, and SQL in one place.",
              "Client-side PDF so there is no print service to operate.",
            ],
          },
          {
            type: "note",
            text: "Not built yet, on purpose: automated tests (first candidate: parseCvData), CI (lint + next build), public share links, and UI i18n. The core to evaluate is OAuth, RLS, the document model, the editor, and export.",
          },
        ],
      },
    ],
  },
  es: {
    kicker: "Documentación técnica",
    title: "De qué está hecha Folio",
    lead: "Editor de currículums en la nube con Google, diez plantillas y exportación PDF A4. Esta página es el brief de producto para reclutadores e ingenieros que revisan el stack.",
    localeLabel: "Español",
    toc: "En esta página",
    repo: "El mismo contenido está en README.md y docs/ARCHITECTURE.md.",
    sections: [
      {
        id: "overview",
        title: "Resumen",
        blocks: [
          {
            type: "p",
            text: "Folio es un producto web full-stack: el usuario autenticado crea CVs privados, cambia de plantilla y exporta un PDF igual a la vista previa. No hay CVs públicos ni panel de administración. Una cuenta tiene muchos documentos.",
          },
          {
            type: "table",
            headers: ["Tema", "Elección"],
            rows: [
              ["Producto", "Editor de CV tipo SaaS"],
              ["Audiencia", "Solo usuarios con sesión"],
              ["Auth", "Google OAuth 2.0 vía Supabase"],
              ["Datos", "PostgreSQL + RLS; el CV vive en JSONB"],
              ["PDF", "Cliente: html2canvas-pro + jsPDF"],
            ],
          },
        ],
      },
      {
        id: "stack",
        title: "Stack tecnológico",
        blocks: [
          {
            type: "table",
            headers: ["Capa", "Tecnología", "Para qué está"],
            rows: [
              [
                "Framework",
                "Next.js 16 (App Router)",
                "Rutas, Server Components, Server Actions, proxy de sesión",
              ],
              ["UI", "React 19", "Editor, vista previa, diez plantillas, tema"],
              [
                "Lenguaje",
                "TypeScript 5",
                "Contrato CvData, cliente tipado de Supabase",
              ],
              [
                "Estilos",
                "Tailwind CSS 4",
                "Tokens de tema, hojas A4, modo oscuro",
              ],
              ["BaaS", "Supabase", "Postgres, Auth, Row Level Security"],
              [
                "Cliente auth",
                "@supabase/ssr",
                "Sesión en cookies en browser y server",
              ],
              [
                "PDF",
                "jsPDF + html2canvas-pro",
                "Captura A4 desde la hoja en pantalla",
              ],
              ["Lint", "ESLint + eslint-config-next", "Reglas de Next y TypeScript"],
            ],
          },
          {
            type: "note",
            text: "No hay API REST propia ni ORM. Next.js habla con Supabase. Crear, borrar y el perfil van en Server Actions.",
          },
        ],
      },
      {
        id: "flow",
        title: "Cómo funciona",
        blocks: [
          {
            type: "ol",
            items: [
              "El usuario entra con Google. Supabase vuelve a /auth/callback con un código de autorización.",
              "El servidor cambia el código por sesión (cookies httpOnly) y crea perfil + primer CV si hace falta.",
              "src/proxy.ts refresca la sesión en cada request y bloquea /dashboard, /cv, /docs y /profile si no hay usuario.",
              "El editor guarda JSON tipado en cvs.data. RLS impide leer o escribir filas de otra cuenta.",
              "La vista previa mapea CvData a un modelo y pinta una de las diez plantillas A4 (794×1123 px).",
              "Exportar clona esa hoja, fuerza tema claro y genera el PDF A4 en el navegador.",
            ],
          },
          {
            type: "code",
            text: "Navegador → proxy Next.js + Server Actions → Supabase Auth / Postgres\nEditor (cliente) → supabase.from(\"cvs\").update → RLS\nExportar PDF → html2canvas-pro + jsPDF (solo cliente)",
          },
        ],
      },
      {
        id: "data",
        title: "Modelo de datos",
        blocks: [
          {
            type: "p",
            text: "Dos tablas públicas, definidas en supabase/schema.sql. auth.users es 1:1 con profiles; cada perfil tiene muchos cvs.",
          },
          {
            type: "table",
            headers: ["Tabla", "Rol"],
            rows: [
              [
                "profiles",
                "id = auth.users.id. Email, nombre, avatar de Google.",
              ],
              [
                "cvs",
                "title + data (JSONB). data guarda plantilla, personales, experiencia, educación, skills, proyectos, idiomas y certificaciones.",
              ],
            ],
          },
          {
            type: "p",
            text: "Un trigger (handle_new_user) y ensureUserWorkspace() dan de alta el primer perfil y CV, por si uno de los dos caminos falla.",
          },
          {
            type: "note",
            text: "JSONB es a propósito. El CV es un documento de formulario que cambia de forma (secciones, plantilla, revisión). Una tabla por viñeta añade joins sin consultas útiles. El contrato es TypeScript: parseCvData / cvDataToJson.",
          },
        ],
      },
      {
        id: "security",
        title: "Seguridad",
        blocks: [
          {
            type: "ul",
            items: [
              "RLS en profiles y cvs: solo auth.uid() puede leer o escribir lo suyo.",
              "Las Server Actions vuelven a llamar getUser() y filtran por user_id.",
              "El Client Secret de Google está en el dashboard de Supabase, no en el repo.",
              "Los archivos .env están en .gitignore; solo se versiona .env.example.",
              "El PDF se genera en el navegador. El CV no pasa por un API de impresión de terceros.",
            ],
          },
        ],
      },
      {
        id: "product",
        title: "Superficie del producto",
        blocks: [
          {
            type: "table",
            headers: ["Ruta", "Acceso", "Para qué"],
            rows: [
              ["/", "Pública", "Landing"],
              ["/login", "Pública", "Entrar con Google"],
              ["/auth/callback", "OAuth", "Código → sesión"],
              ["/dashboard", "Privada", "Lista de CVs"],
              ["/cv/[id]", "Privada", "Editor y vista previa A4"],
              ["/docs", "Privada", "Esta documentación"],
              ["/profile", "Privada", "Nombre de la cuenta"],
            ],
          },
          {
            type: "ul",
            items: [
              "Diez plantillas con estructura distinta (Harvard ATS, consultoría, barra lateral, dos columnas y otras).",
              "Harvard: una columna, sin foto ni iconos, viñetas de logros — compatible ATS.",
              "Modo oscuro con data-theme y localStorage, sin flash al cargar. La hoja del CV se queda clara para imprimir.",
              "Editor responsive: pestañas editar / vista previa en móvil.",
            ],
          },
        ],
      },
      {
        id: "decisions",
        title: "Decisiones y siguientes pasos",
        blocks: [
          {
            type: "ul",
            items: [
              "App Router + Server Actions en lugar de una API REST propia.",
              "Supabase en lugar de Auth.js + Prisma + Postgres alojado: OAuth, RLS y SQL en un solo sitio.",
              "PDF en el cliente para no operar un servicio de impresión.",
            ],
          },
          {
            type: "note",
            text: "Aún no está, a propósito: tests automatizados (primero parseCvData), CI (lint + next build), enlaces públicos y UI multi-idioma. Lo evaluable es OAuth, RLS, el modelo de documento, el editor y la exportación.",
          },
        ],
      },
    ],
  },
};
