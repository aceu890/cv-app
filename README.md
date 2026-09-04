# Folio

Web résumé editor. Users sign in with Google, create one or more CV versions, pick among 10 distinct layouts, and export to PDF. Every change is saved to their account.

This repo is a full-stack portfolio product: real authentication, a database with security policies, document rendering, and export.

**Local demo:** `npm run dev` → [http://localhost:3000](http://localhost:3000)

[Español ↓](#folio-español)

---

## For recruiters

| Question | Answer |
|---|---|
| What is it? | Lightweight SaaS to create and store CVs in the cloud |
| Who uses it? | Authenticated users; each person only sees their own data |
| Stack | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres + Auth), Google OAuth |
| Backend | Server Actions, OAuth Route Handler, session proxy, PostgreSQL with RLS |
| Document | The CV lives as typed JSON (`CvData`) in a JSONB column |
| PDF | DOM capture with `html2canvas-pro` + `jsPDF`, A4 |
| Auth | Google OAuth 2.0 via Supabase; httpOnly cookies; protected routes |
| Extra | 10 templates, dark mode, responsive UI, calendar date picker |

Detailed architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Features

- Sign up and sign in with Google
- User profile (name, email, Google avatar)
- Several CVs per account: create, edit, save, delete
- Editor sections: personal data, experience (achievements), education, skills, projects, languages, certifications
- 10 templates with different structure (not just color): Harvard ATS, consulting, two columns, sidebar, etc.
- Live A4 preview, scaled to the panel width
- PDF export that matches the selected template
- Light / dark mode persisted in `localStorage`
- Mobile-first layout (edit / preview tabs)

---

## Stack

### Application

| Layer | Technology | Role in this project |
|---|---|---|
| Framework | Next.js 16 (App Router) | Routes, Server Components, Server Actions, session proxy |
| UI | React 19 | Editor, preview, templates, theme |
| Language | TypeScript 5 | CV types, Supabase client, props |
| Styles | Tailwind CSS 4 | Theme tokens, A4 layouts, dark mode (`data-theme`) |
| Fonts | `next/font` (Geist + Fraunces) | Sans for the app, serif for editorial templates |

### Data and auth

| Layer | Technology | Role in this project |
|---|---|---|
| BaaS | Supabase | Postgres, Auth, RLS |
| Auth | Google OAuth 2.0 | `signInWithOAuth` + `/auth/callback` |
| SSR client | `@supabase/ssr` | Cookie session, browser and server clients |
| Persistence | PostgreSQL | `profiles` and `cvs` tables |
| CV document | JSONB | One `CvData` object per résumé |

### Export and quality

| Layer | Technology | Role in this project |
|---|---|---|
| PDF | jsPDF + html2canvas-pro | A4 page from the preview |
| Lint | ESLint + `eslint-config-next` | Next and TypeScript rules |

There is no custom backend or ORM. Next.js talks to Supabase; sensitive business rules (create CV, delete, profile) live in Server Actions.

---

## How it works

```text
Browser                      Next.js                         Supabase
───────                      ───────                         ────────
Landing / Login
    │
    ├─ Google ──────────────► /auth/callback
    │                         exchangeCodeForSession  ──────► Auth
    │                         ensureUserWorkspace     ──────► profiles + first CV
    │                         redirect /dashboard
    │
    ├─ Editor (client) ─────► supabase.from("cvs").update ──► Postgres + RLS
    ├─ Create / delete ─────► Server Action ────────────────► Postgres + RLS
    └─ Export PDF ──────────► html2canvas + jsPDF (client only)
```

1. The user clicks **Continue with Google**.
2. Supabase redirects to Google and returns to `/auth/callback` with a `code`.
3. The server exchanges the code for a session (cookies) and creates a profile + first CV if they do not exist.
4. The proxy (`src/proxy.ts`) refreshes the session on each request and blocks `/dashboard`, `/cv/*`, and `/profile` when there is no user.
5. The editor saves the CV JSON in `cvs.data`. Row Level Security prevents reading or writing another account’s CVs.
6. The preview maps `CvData` → view model and renders one of the 10 templates at A4 size (794×1123 px).
7. PDF export clones that sheet, forces light theme, and writes an A4 file.

---

## Repository structure

```text
src/
  app/
    page.tsx                 Public landing
    login/                   Sign-in
    auth/callback/           OAuth: code → session
    (app)/                   Authenticated area (header + padding)
      dashboard/             CV list
      cv/[id]/               Editor + preview
      docs/                  In-app technical documentation
      profile/               Account name
  components/                UI: editor, templates, PDF, theme, Google
  lib/
    actions/account.ts       Server Actions (CV and profile CRUD)
    auth/workspace.ts        Profile + CV on first login
    cv/                      Schema, templates, PDF, dates, seeds
    supabase/                Clients, env, types, session proxy
  proxy.ts                   Route guard + cookie refresh
supabase/schema.sql          Tables, triggers, RLS
docs/ARCHITECTURE.md         Technical design
```

---

## Requirements

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project
- Google OAuth (Google Cloud Console → Client ID and Secret)

---

## Setup

```bash
git clone <repo-url>
cd cv-app
npm install
copy .env.example .env.local
```

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` (classic anon key name) is also accepted.

### Database

1. In Supabase: **SQL Editor** → paste and run `supabase/schema.sql`.
2. **Authentication → Providers → Google**: enable and paste Client ID / Secret.
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. In Google Cloud, the authorized redirect URI must be:
   `https://<project>.supabase.co/auth/v1/callback`

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the build |
| `npm run lint` | ESLint |

---

## Data model (summary)

**`profiles`** — 1:1 with `auth.users`. Email, name, avatar.

**`cvs`** — N per user. `title` + `data` (JSONB). The JSON includes template, personal data, experience, education, skills, projects, languages, and certifications.

A `handle_new_user` trigger creates a profile and an empty CV on sign-up. The app also covers that bootstrap in `ensureUserWorkspace` if the trigger does not run.

Tables, RLS, and the `CvData` type: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Security

- RLS on `profiles` and `cvs`: only `auth.uid()` can read and write their rows.
- Server Actions check the user again and filter by `user_id`.
- Google secrets live in the Supabase dashboard, not in the repo.
- `.env*` is in `.gitignore`. Only `.env.example` is versioned.
- The PDF is generated in the browser: CV content does not go through an external print service.

---

## Design decisions

- **JSONB for the CV** — the document changes shape (sections, templates, revision). A table per block is unnecessary.
- **Templates in React, not static HTML** — each layout is a component; the same data feeds preview and print.
- **Harvard as the ATS template** — one column, no icons or photo, achievement bullets.
- **html2canvas-pro** — capture respects modern CSS colors; the PDF matches the preview.
- **No automated tests yet** — the natural next step is Vitest on the CV schema and a lint + build pipeline.

---

## Author

Fernando Andrés Soto Gazul  
Full-stack · Valparaíso, Chile

- GitHub: [github.com/aceu890](https://github.com/aceu890)
- LinkedIn: [linkedin.com/in/fernando-andres-soto-gazul](https://www.linkedin.com/in/fernando-andres-soto-gazul)
- Portfolio: [fernando-dev.netlify.app](https://fernando-dev.netlify.app/)

---
---

# Folio (Español)

Editor web de currículums. El usuario entra con Google, crea una o más versiones de su CV, elige entre 10 plantillas con layouts distintos y exporta a PDF. Cada cambio queda guardado en su cuenta.

Este repositorio es un producto full-stack de portafolio: autenticación real, base de datos con políticas de seguridad, renderizado de documentos y exportación.

**Demo local:** `npm run dev` → [http://localhost:3000](http://localhost:3000)

[English ↑](#folio)

---

## Para reclutadores

| Pregunta | Respuesta |
|---|---|
| ¿Qué es? | SaaS ligero para crear y guardar CVs en la nube |
| ¿Quién lo usa? | Usuario autenticado; cada uno ve solo sus datos |
| Stack | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres + Auth), OAuth de Google |
| Backend | Server Actions, Route Handler de OAuth, proxy de sesión, PostgreSQL con RLS |
| Documento | El CV vive como JSON tipado (`CvData`) en una columna JSONB |
| PDF | Captura del DOM con `html2canvas-pro` + `jsPDF`, formato A4 |
| Auth | Google OAuth 2.0 vía Supabase; cookies httpOnly; rutas protegidas |
| Extra | 10 plantillas, modo oscuro, UI responsive, fechas con calendario |

Arquitectura detallada: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Funcionalidades

- Registro e inicio de sesión con Google
- Perfil de usuario (nombre, email, avatar de Google)
- Varios CVs por cuenta: crear, editar, guardar, borrar
- Editor con secciones: datos personales, experiencia (logros), educación, skills, proyectos, idiomas, certificaciones
- 10 plantillas con estructura distinta (no solo color): Harvard ATS, consultoría, dos columnas, barra lateral, etc.
- Vista previa A4 en vivo, escalada al ancho del panel
- Exportación a PDF que respeta el diseño de la plantilla
- Modo claro / oscuro persistido en `localStorage`
- Layout pensado para móvil (pestañas editar / vista previa)

---

## Stack

### Aplicación

| Capa | Tecnología | Uso en este proyecto |
|---|---|---|
| Framework | Next.js 16 (App Router) | Rutas, Server Components, Server Actions, proxy de sesión |
| UI | React 19 | Editor, preview, plantillas, tema |
| Lenguaje | TypeScript 5 | Tipos del CV, cliente de Supabase, props |
| Estilos | Tailwind CSS 4 | Tokens de tema, layouts A4, dark mode (`data-theme`) |
| Fuentes | `next/font` (Geist + Fraunces) | Sans para la app, serif para plantillas editoriales |

### Datos y autenticación

| Capa | Tecnología | Uso en este proyecto |
|---|---|---|
| BaaS | Supabase | Postgres, Auth, RLS |
| Auth | Google OAuth 2.0 | `signInWithOAuth` + callback `/auth/callback` |
| Cliente SSR | `@supabase/ssr` | Sesión en cookies, cliente browser y server |
| Persistencia | PostgreSQL | Tablas `profiles` y `cvs` |
| Documento CV | JSONB | Un objeto `CvData` por currículum |

### Exportación y calidad

| Capa | Tecnología | Uso en este proyecto |
|---|---|---|
| PDF | jsPDF + html2canvas-pro | Hoja A4 a partir de la vista previa |
| Lint | ESLint + `eslint-config-next` | Reglas de Next y TypeScript |

No hay backend propio ni ORM. Next.js habla con Supabase; las reglas de negocio sensibles (crear CV, borrar, perfil) van en Server Actions.

---

## Cómo funciona

```text
Navegador                    Next.js                         Supabase
─────────                    ───────                         ────────
Landing / Login
    │
    ├─ Google ──────────────► /auth/callback
    │                         exchangeCodeForSession  ──────► Auth
    │                         ensureUserWorkspace     ──────► profiles + CV inicial
    │                         redirect /dashboard
    │
    ├─ Editor (cliente) ────► supabase.from("cvs").update ──► Postgres + RLS
    ├─ Crear / borrar ──────► Server Action ────────────────► Postgres + RLS
    └─ Exportar PDF ────────► html2canvas + jsPDF (solo cliente)
```

1. El usuario pulsa **Continuar con Google**.
2. Supabase redirige a Google y vuelve a `/auth/callback` con un `code`.
3. El servidor intercambia el código por sesión (cookies) y crea perfil + primer CV si no existen.
4. El proxy (`src/proxy.ts`) refresca la sesión en cada request y bloquea `/dashboard`, `/cv/*` y `/profile` si no hay usuario.
5. El editor guarda el JSON del CV en `cvs.data`. Row Level Security impide leer o escribir CVs de otra cuenta.
6. El preview mapea `CvData` → modelo de vista y renderiza una de las 10 plantillas a tamaño A4 (794×1123 px).
7. Exportar PDF clona esa hoja, fuerza tema claro y genera un archivo A4.

---

## Estructura del repositorio

```text
src/
  app/
    page.tsx                 Landing pública
    login/                   Inicio de sesión
    auth/callback/           OAuth: code → sesión
    (app)/                   Área autenticada (header + padding)
      dashboard/             Lista de CVs
      cv/[id]/               Editor + preview
      docs/                  Documentación técnica en la app
      profile/               Nombre de la cuenta
  components/                UI: editor, plantillas, PDF, tema, Google
  lib/
    actions/account.ts       Server Actions (CRUD de CV y perfil)
    auth/workspace.ts        Alta de perfil + CV al primer login
    cv/                      Schema, plantillas, PDF, fechas, seeds
    supabase/                Clientes, env, tipos, proxy de sesión
  proxy.ts                   Guard de rutas + refresh de cookies
supabase/schema.sql          Tablas, triggers, RLS
docs/ARCHITECTURE.md         Diseño técnico
```

---

## Requisitos

- Node.js 20+
- npm
- Proyecto en [Supabase](https://supabase.com)
- OAuth de Google (Google Cloud Console → Client ID y Secret)

---

## Instalación

```bash
git clone <url-del-repo>
cd cv-app
npm install
copy .env.example .env.local
```

En `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

También se acepta `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nombre clásico de la anon key).

### Base de datos

1. En Supabase: **SQL Editor** → pegar y ejecutar `supabase/schema.sql`.
2. **Authentication → Providers → Google**: activar y pegar Client ID / Secret.
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
4. En Google Cloud, la redirect URI autorizada debe ser:
   `https://<proyecto>.supabase.co/auth/v1/callback`

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión con Google.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |
| `npm run lint` | ESLint |

---

## Modelo de datos (resumen)

**`profiles`** — 1:1 con `auth.users`. Email, nombre, avatar.

**`cvs`** — N por usuario. `title` + `data` (JSONB). El JSON incluye plantilla, datos personales, experiencia, educación, skills, proyectos, idiomas y certificaciones.

Un trigger `handle_new_user` crea perfil y un CV vacío al registrarse. La app también cubre ese alta en `ensureUserWorkspace` por si el trigger no corre.

Detalle de tablas, RLS y el tipo `CvData`: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Seguridad

- RLS en `profiles` y `cvs`: solo `auth.uid()` ve y modifica lo suyo.
- Las Server Actions vuelven a comprobar el usuario y filtran por `user_id`.
- Secretos de Google viven en el dashboard de Supabase, no en el repo.
- `.env*` está en `.gitignore`. Solo se versiona `.env.example`.
- El PDF se genera en el navegador: el contenido del CV no pasa por un servicio externo de impresión.

---

## Decisiones de diseño

- **JSONB para el CV** — el documento cambia de forma (secciones, plantillas, revisión). No hace falta una tabla por bloque.
- **Plantillas en React, no en HTML estático** — cada layout es un componente; el mismo dato alimenta preview e impresión.
- **Harvard como plantilla ATS** — una columna, sin iconos ni foto, viñetas de logros.
- **html2canvas-pro** — la captura respeta colores modernos de CSS; el PDF replica la vista previa.
- **Sin tests automatizados todavía** — el siguiente paso natural es Vitest en el schema del CV y un pipeline de lint + build.

---

## Autor

Fernando Andrés Soto Gazul  
Full-stack · Valparaíso, Chile

- GitHub: [github.com/aceu890](https://github.com/aceu890)
- LinkedIn: [linkedin.com/in/fernando-andres-soto-gazul](https://www.linkedin.com/in/fernando-andres-soto-gazul)
- Portafolio: [fernando-dev.netlify.app](https://fernando-dev.netlify.app/)
