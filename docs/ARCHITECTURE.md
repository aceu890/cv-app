# Architecture — Folio

Technical document for the résumé editor. Complements the [README](../README.md). Meant for code review, onboarding, or an interview about the project.

[Español ↓](#arquitectura--folio-español)

---

## 1. Context

Folio is a monolithic Next.js web app that uses Supabase as a managed backend.

**Actors**

| Actor | What they do |
|---|---|
| Visitor | Sees the landing page and login |
| Authenticated user (Google) | Creates and edits CVs, changes template, exports PDF, edits their name |
| Supabase Auth | Issues the session, stores the Google user |
| Postgres + RLS | Persists profiles and documents; isolates data by `auth.uid()` |

There is no admin panel and no public CVs. The product is 1 user → N private documents.

---

## 2. Container view

```text
┌─────────────────────────────────────────────────────────────┐
│  Client (React 19)                                          │
│  Landing, login, editor, A4 preview, theme toggle, PDF      │
└─────────────┬───────────────────────────────┬───────────────┘
              │ Server Actions / RSC          │ Client JS
              ▼                               ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│  Next.js 16              │    │  @supabase/ssr (browser)    │
│  • proxy (session+guard) │    │  update of cvs.data         │
│  • /auth/callback        │    └──────────────┬──────────────┘
│  • Server Actions        │                   │
│  • Server Components     │                   │
└─────────────┬────────────┘                   │
              │ createServerClient             │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                   │
│  Auth (Google OAuth)  ·  Postgres  ·  RLS                   │
└─────────────────────────────────────────────────────────────┘
```

**Preview and PDF never hit the server.** The server persists JSON; the browser paints it and, if the user exports, rasterizes it.

---

## 3. Authentication

OAuth 2.0 Authorization Code flow (PKCE is handled by `@supabase/ssr`).

```text
User                   Folio                      Supabase                 Google
   │                     │                            │                      │
   │  click Google       │                            │                      │
   │────────────────────►│  signInWithOAuth           │                      │
   │                     │───────────────────────────►│  redirect            │
   │                     │                            │─────────────────────►│
   │  consent            │                            │◄─────────────────────│
   │                     │  GET /auth/callback?code=  │                      │
   │                     │◄───────────────────────────│                      │
   │                     │  exchangeCodeForSession    │                      │
   │                     │───────────────────────────►│                      │
   │                     │  session cookies           │                      │
   │                     │  ensureUserWorkspace()     │                      │
   │  /dashboard         │                            │                      │
   │◄────────────────────│                            │                      │
```

**Files**

| File | Role |
|---|---|
| `src/components/google-button.tsx` | Starts OAuth on the client |
| `src/app/auth/callback/route.ts` | Exchanges `code` for a session; creates workspace |
| `src/lib/auth/workspace.ts` | Upsert of `profiles` + initial CV |
| `src/proxy.ts` + `src/lib/supabase/proxy.ts` | Cookie refresh; redirects anonymous users away from private routes |
| `src/lib/actions/account.ts` → `signOut` | Signs out and sends the user to `/login` |

**Protected routes:** `/dashboard`, `/cv/*`, `/profile`.  
If there is a session and the user opens `/login`, the proxy sends them to the dashboard.

In Next.js 16 the guard lives in `src/proxy.ts` (equivalent to `middleware` in earlier versions).

---

## 4. Data model

### 4.1 Relational

Defined in `supabase/schema.sql`.

```text
auth.users 1 ─── 1 profiles
                  │
                  │ 1
                  │
                  └─── N cvs
```

**`public.profiles`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Same as `auth.users.id`, `ON DELETE CASCADE` |
| `email` | text | From Google |
| `full_name` | text | Editable on `/profile` |
| `avatar_url` | text | Google photo |
| `created_at` / `updated_at` | timestamptz | `updated_at` via trigger |

**`public.cvs`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid FK → profiles | `ON DELETE CASCADE` |
| `title` | text | Name on the dashboard |
| `data` | jsonb | CV document |
| `created_at` / `updated_at` | timestamptz | Index `(user_id, updated_at desc)` |

### 4.2 Automatic provisioning

Two paths, redundant on purpose:

1. Trigger `on_auth_user_created` → `handle_new_user()` (security definer).
2. `ensureUserWorkspace()` in the OAuth callback.

The first login still gets a profile even if one side fails.

### 4.3 JSON document (`CvData`)

Types live in `src/lib/cv/schema.ts`. JSON is validated on read (`parseCvData`) and serialized on save (`cvDataToJson`).

```text
CvData
├── template          folio | atlas | nordico | ejecutivo | columna
│                     academia | tecnico | metro | aurora | terra
├── sourceRevision?   version of code-generated CVs (seed)
├── personal          name, title, contact, summary
├── experience[]      company, role, dates, highlights[]
├── education[]       school, degree, dates, details
├── skills[]          competency lines
├── projects[]        name, description, technologies, result
├── languages[]       language + level (A1–C2 / native)
└── certifications[]  name, issuer, year
```

**Why JSONB instead of a table per section**

The CV is a form document: the user adds or removes blocks, switches templates, and sometimes a seed is versioned (`sourceRevision`). Normalizing every bullet in SQL does not buy queries; it adds joins. JSONB + a TypeScript schema is the contract.

### 4.4 Hand-written types

`src/lib/supabase/database.types.ts` describes `profiles` and `cvs` for the typed client. The type-gen CLI is not used yet (it can be added later).

---

## 5. Security (RLS)

Every policy uses `auth.uid()`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `auth.uid() = id` | same | same | — |
| `cvs` | `auth.uid() = user_id` | same | same | same |

Grants only to the `authenticated` role. The frontend anon key cannot bypass RLS.

Server Actions do not rely on RLS alone: they call `getUser()` and filter again by `user_id` on update/delete.

Secrets:

- Google Client Secret: only in the Supabase dashboard.
- In the repo: `.env.example` with no real values.
- The PDF does not upload the CV to any third-party API.

---

## 6. Application layers

### 6.1 Routes

| Route | Kind | Auth |
|---|---|---|
| `/` | Landing | Public |
| `/login` | OAuth | Public; if session → dashboard |
| `/auth/callback` | Route Handler | Exchanges the code |
| `/dashboard` | RSC + actions | Private |
| `/cv/[id]` | RSC + client editor | Private; 404 if the CV is not the user’s |
| `/profile` | RSC + form | Private |

### 6.2 Mutations

| Action | Where | Why |
|---|---|---|
| Create / delete CV, seeds, logout, profile | Server Action (`account.ts`) | Redirect, `revalidatePath`, session check |
| Save editor | Client (`cv-editor.tsx`) | Frequent saves without an Action round-trip |

### 6.3 Supabase clients

| Factory | Environment | File |
|---|---|---|
| `createBrowserClient` | Client | `src/lib/supabase/client.ts` |
| `createServerClient` + `cookies()` | Server Components / Actions / Route Handlers | `src/lib/supabase/server.ts` |
| `createServerClient` + request cookies | Proxy | `src/lib/supabase/proxy.ts` |

`getSupabaseEnv()` reads `NEXT_PUBLIC_SUPABASE_URL` and the publishable/anon key. If they are missing, private routes redirect to login instead of breaking the build.

---

## 7. CV rendering

```text
CvData  ──parse / map──►  PreviewModel  ──switch template──►  React layout
                              │
                              └── #cv-sheet (min 794×1123 px)
                                        │
                                        ├── Preview: CSS scale to panel width
                                        └── PDF: html2canvas-pro → jsPDF A4
```

- **Preview** (`cv-preview.tsx`): `ResizeObserver` computes `scale = min(1, width / 794)`. The frame uses the sheet’s visual height.
- **Layouts** (`cv-layouts.tsx`): ten components. Each uses `.cv-page` (`min-height: 1123px`) to fill A4. Harvard is a single ATS column; the others change columns, header, and section order.
- **PDF** (`lib/cv/pdf.ts`): removes the scale `transform`, forces light theme on the clone (the PDF must not render in dark mode), captures at 2×, and writes A4. If content fits or only overflows a little, one page; otherwise several.

Body line-height is 1.25 (1.15 in Consulting and Technology), aligned with professional résumés.

---

## 8. Theme

- `data-theme="light|dark"` on `<html>`.
- Inline script in `layout.tsx` reads `localStorage.folio-theme` or `prefers-color-scheme` **before** hydrate (no flash).
- Tokens in `globals.css` (`--paper`, `--ink`, `--accent`, …) and Tailwind 4 `@theme inline`.
- `ThemeToggle` writes the attribute and `localStorage`.
- The CV canvas (`.cv-sheet`) stays light: a résumé is delivered on white paper.

---

## 9. CV seeds

Some documents are generated in code, not by hand:

| Seed | File | Behavior |
|---|---|---|
| Empty CV | `schema.ts` → `createDefaultCvData` | On CV create or first login |
| Full-stack example | `example.ts` | Dashboard button; does not overwrite if it already exists |
| Fernando’s CV | `fernando.ts` | Create or update. `sourceRevision` forces a refresh when the code changes |

`/cv/[id]` and the dashboard compare `data.sourceRevision` with `FERNANDO_CV_REVISION` and rewrite the JSON if it is stale.

---

## 10. Decisions and non-goals

**Chosen**

- Next App Router + Server Actions instead of a custom REST API.
- Supabase instead of Auth.js + Prisma + hosted Postgres: OAuth, RLS, and SQL in one place.
- JSONB for the CV document.
- Client-side export so there is no PDF service to operate.

**Not there (yet)**

- Automated tests (first candidate: `parseCvData` / `cvDataToJson`).
- CI/CD (lint + `next build` on GitHub Actions).
- UI i18n (the app is in Spanish; the CV is user content).
- Public CVs or read-only links.
- Real-time collaboration.

Those absences are intentional. The core a recruiter should be able to evaluate is: OAuth, RLS, document model, editor UI, and export.

---

## 11. Environment and deploy

Variables (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# or NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

For production:

1. Deploy the front (e.g. Vercel) with those variables.
2. In Supabase, add the real domain as Site URL and Redirect URL.
3. In Google Cloud, the Supabase redirect does not change (`https://<ref>.supabase.co/auth/v1/callback`).
4. Run `schema.sql` again only if the Postgres project is new.

---

## 12. Key file map

| Path | Responsibility |
|---|---|
| `src/proxy.ts` | Matcher + session update delegation |
| `src/lib/supabase/proxy.ts` | JWT cookie refresh and route guard |
| `src/lib/actions/account.ts` | Authenticated mutations |
| `src/lib/cv/schema.ts` | Document contract |
| `src/lib/cv/templates.ts` | Catalog of 10 templates |
| `src/components/cv-layouts.tsx` | Render of each template |
| `src/components/cv-editor.tsx` | Form state, save, PDF |
| `src/lib/cv/pdf.ts` | A4 constants and export |
| `supabase/schema.sql` | Source of truth for the database |

---
---

# Arquitectura — Folio (Español)

Documento técnico del editor de currículums. Complementa el [README](../README.md). Pensado para revisión de código, onboarding o una entrevista sobre el proyecto.

[English ↑](#architecture--folio)

---

## 1. Contexto

Folio es una aplicación web monolítica (Next.js) que usa Supabase como backend gestionado.

**Actores**

| Actor | Qué hace |
|---|---|
| Visitante | Ve la landing y el login |
| Usuario autenticado (Google) | Crea y edita CVs, cambia plantilla, exporta PDF, edita su nombre |
| Supabase Auth | Emite sesión, guarda el usuario de Google |
| Postgres + RLS | Persiste perfiles y documentos; aísla datos por `auth.uid()` |

No hay panel de administración ni CVs públicos. El producto es 1 usuario → N documentos privados.

---

## 2. Vista de contenedores

```text
┌─────────────────────────────────────────────────────────────┐
│  Cliente (React 19)                                         │
│  Landing, login, editor, preview A4, toggle de tema, PDF    │
└─────────────┬───────────────────────────────┬───────────────┘
              │ Server Actions / RSC          │ Cliente JS
              ▼                               ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│  Next.js 16              │    │  @supabase/ssr (browser)    │
│  • proxy (sesión+guard)  │    │  update de cvs.data         │
│  • /auth/callback        │    └──────────────┬──────────────┘
│  • Server Actions        │                   │
│  • Server Components     │                   │
└─────────────┬────────────┘                   │
              │ createServerClient             │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase                                                   │
│  Auth (Google OAuth)  ·  Postgres  ·  RLS                   │
└─────────────────────────────────────────────────────────────┘
```

El **preview y el PDF no pasan por el servidor**. El servidor persiste JSON; el navegador lo pinta y, si el usuario exporta, lo rasteriza.

---

## 3. Autenticación

Flujo OAuth 2.0 Authorization Code (PKCE lo gestiona `@supabase/ssr`).

```text
Usuario                Folio                      Supabase                 Google
   │                     │                            │                      │
   │  click Google       │                            │                      │
   │────────────────────►│  signInWithOAuth           │                      │
   │                     │───────────────────────────►│  redirect            │
   │                     │                            │─────────────────────►│
   │  consent            │                            │◄─────────────────────│
   │                     │  GET /auth/callback?code=  │                      │
   │                     │◄───────────────────────────│                      │
   │                     │  exchangeCodeForSession    │                      │
   │                     │───────────────────────────►│                      │
   │                     │  cookies de sesión         │                      │
   │                     │  ensureUserWorkspace()     │                      │
   │  /dashboard         │                            │                      │
   │◄────────────────────│                            │                      │
```

**Archivos**

| Archivo | Rol |
|---|---|
| `src/components/google-button.tsx` | Inicia OAuth en el cliente |
| `src/app/auth/callback/route.ts` | Intercambia `code` por sesión; crea workspace |
| `src/lib/auth/workspace.ts` | Upsert de `profiles` + CV inicial |
| `src/proxy.ts` + `src/lib/supabase/proxy.ts` | Refresh de cookies; redirige anónimos fuera de rutas privadas |
| `src/lib/actions/account.ts` → `signOut` | Cierra sesión y manda a `/login` |

**Rutas protegidas:** `/dashboard`, `/cv/*`, `/profile`.  
Si hay sesión y el usuario entra a `/login`, el proxy lo manda al dashboard.

En Next.js 16 el guard vive en `src/proxy.ts` (equivalente al `middleware` de versiones anteriores).

---

## 4. Modelo de datos

### 4.1 Relacional

Definido en `supabase/schema.sql`.

```text
auth.users 1 ─── 1 profiles
                  │
                  │ 1
                  │
                  └─── N cvs
```

**`public.profiles`**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | Igual a `auth.users.id`, `ON DELETE CASCADE` |
| `email` | text | De Google |
| `full_name` | text | Editable en `/profile` |
| `avatar_url` | text | Foto de Google |
| `created_at` / `updated_at` | timestamptz | `updated_at` por trigger |

**`public.cvs`**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid FK → profiles | `ON DELETE CASCADE` |
| `title` | text | Nombre en el dashboard |
| `data` | jsonb | Documento del CV |
| `created_at` / `updated_at` | timestamptz | Índice `(user_id, updated_at desc)` |

### 4.2 Alta automática

Dos caminos, a propósito redundantes:

1. Trigger `on_auth_user_created` → `handle_new_user()` (security definer).
2. `ensureUserWorkspace()` en el callback de OAuth.

Así el primer login no deja al usuario sin perfil aunque falle un lado.

### 4.3 Documento JSON (`CvData`)

Tipos en `src/lib/cv/schema.ts`. El JSON se valida al leer (`parseCvData`) y se serializa al guardar (`cvDataToJson`).

```text
CvData
├── template          folio | atlas | nordico | ejecutivo | columna
│                     academia | tecnico | metro | aurora | terra
├── sourceRevision?   versión de CVs generados por código (seed)
├── personal          nombre, titular, contacto, resumen
├── experience[]      empresa, cargo, fechas, logros[]
├── education[]       institución, título, fechas, detalle
├── skills[]          líneas de competencias
├── projects[]        nombre, descripción, tecnologías, resultado
├── languages[]       idioma + nivel (A1–C2 / nativo)
└── certifications[]  nombre, emisor, año
```

**Por qué JSONB y no tablas por sección**

El CV es un documento de formulario: el usuario añade o quita bloques, cambia de plantilla y a veces se versiona un seed (`sourceRevision`). Normalizar cada viñeta en SQL no aporta consultas; sí añade joins. JSONB + un schema TypeScript es el contrato.

### 4.4 Tipos generados a mano

`src/lib/supabase/database.types.ts` describe `profiles` y `cvs` para el cliente tipado. No se usa el CLI de gen de tipos (se puede añadir después).

---

## 5. Seguridad (RLS)

Todas las políticas usan `auth.uid()`.

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `auth.uid() = id` | igual | igual | — |
| `cvs` | `auth.uid() = user_id` | igual | igual | igual |

Grants solo a rol `authenticated`. El anon key del frontend no puede saltarse RLS.

Las Server Actions no confían solo en RLS: leen `getUser()` y filtran otra vez por `user_id` en update/delete.

Secretos:

- Google Client Secret: solo en el dashboard de Supabase.
- En el repo: `.env.example` sin valores reales.
- El PDF no sube el CV a ningún API de terceros.

---

## 6. Capas de la aplicación

### 6.1 Rutas

| Ruta | Tipo | Auth |
|---|---|---|
| `/` | Landing | Pública |
| `/login` | OAuth | Pública; si hay sesión → dashboard |
| `/auth/callback` | Route Handler | Intercambia el code |
| `/dashboard` | RSC + actions | Privada |
| `/cv/[id]` | RSC + editor cliente | Privada; 404 si el CV no es del usuario |
| `/profile` | RSC + form | Privada |

### 6.2 Mutaciones

| Acción | Dónde | Por qué |
|---|---|---|
| Crear / borrar CV, crear seeds, logout, perfil | Server Action (`account.ts`) | Redirect, `revalidatePath`, chequeo de sesión |
| Guardar editor | Cliente (`cv-editor.tsx`) | Autosave frecuente sin round-trip de action |

### 6.3 Clientes Supabase

| Factory | Entorno | Archivo |
|---|---|---|
| `createBrowserClient` | Cliente | `src/lib/supabase/client.ts` |
| `createServerClient` + `cookies()` | Server Components / Actions / Route Handlers | `src/lib/supabase/server.ts` |
| `createServerClient` + cookies del request | Proxy | `src/lib/supabase/proxy.ts` |

`getSupabaseEnv()` lee `NEXT_PUBLIC_SUPABASE_URL` y la publishable/anon key. Si faltan, las rutas privadas redirigen a login en lugar de romper el build.

---

## 7. Renderizado del CV

```text
CvData  ──parse / map──►  PreviewModel  ──switch template──►  Layout React
                              │
                              └── #cv-sheet (794×1123 px mín.)
                                        │
                                        ├── Preview: scale CSS al ancho del panel
                                        └── PDF: html2canvas-pro → jsPDF A4
```

- **Preview** (`cv-preview.tsx`): `ResizeObserver` calcula `scale = min(1, ancho / 794)`. El marco tiene la altura visual de la hoja.
- **Layouts** (`cv-layouts.tsx`): diez componentes. Cada uno usa `.cv-page` (`min-height: 1123px`) para llenar A4. Harvard es una columna ATS; el resto cambia columnas, cabecera y orden de secciones.
- **PDF** (`lib/cv/pdf.ts`): quita el `transform` de escala, fuerza tema claro en el clone (el PDF no debe salir en dark mode), captura a 2× y escribe A4. Si el contenido cabe o se pasa poco, una sola página; si no, varias.

El interlineado de cuerpo es 1.25 (1.15 en Consultoría y Tecnología), alineado a CVs laborales.

---

## 8. Tema

- Atributo `data-theme="light|dark"` en `<html>`.
- Script inline en `layout.tsx` lee `localStorage.folio-theme` o `prefers-color-scheme` **antes** del hydrate (evita flash).
- Tokens en `globals.css` (`--paper`, `--ink`, `--accent`, …) y `@theme inline` de Tailwind 4.
- `ThemeToggle` escribe el atributo y `localStorage`.
- El lienzo del CV (`.cv-sheet`) se mantiene claro: un currículum se entrega en papel blanco.

---

## 9. Seeds de CV

Algunos documentos se generan en código, no a mano:

| Seed | Archivo | Comportamiento |
|---|---|---|
| CV vacío | `schema.ts` → `createDefaultCvData` | Al crear CV o al primer login |
| Ejemplo full-stack | `example.ts` | Botón en el dashboard; no pisa si ya existe |
| CV de Fernando | `fernando.ts` | Create or update. `sourceRevision` fuerza refresco si el código cambió |

`/cv/[id]` y el dashboard comparan `data.sourceRevision` con `FERNANDO_CV_REVISION` y reescriben el JSON si está desfasado.

---

## 10. Decisiones y no-objetivos

**Se eligió**

- Next App Router + Server Actions en lugar de una API REST propia.
- Supabase en lugar de Auth.js + Prisma + hosting de Postgres: OAuth, RLS y SQL en un solo sitio.
- JSONB para el documento del CV.
- Exportación en cliente para no operar un servicio de PDF.

**No está (aún)**

- Tests automatizados (el primer candidato: `parseCvData` / `cvDataToJson`).
- CI/CD (lint + `next build` en GitHub Actions).
- Multi-idioma de la UI (la app está en español; el CV es contenido del usuario).
- CVs públicos o enlaces de solo lectura.
- Colaboración en tiempo real.

Esas ausencias son conscientes. El núcleo que un reclutador debe poder evaluar es: OAuth, RLS, modelo de documento, UI de editor y exportación.

---

## 11. Entorno y despliegue

Variables (ver `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# o NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Para producción:

1. Deploy del front (p. ej. Vercel) con esas variables.
2. En Supabase, añadir Site URL y Redirect URL del dominio real.
3. En Google Cloud, la redirect de Supabase no cambia (`https://<ref>.supabase.co/auth/v1/callback`).
4. Volver a ejecutar `schema.sql` solo si el proyecto de Postgres es nuevo.

---

## 12. Mapa de archivos clave

| Ruta | Responsabilidad |
|---|---|
| `src/proxy.ts` | Matcher + delegación al update de sesión |
| `src/lib/supabase/proxy.ts` | Refresh de JWT en cookies y guard de rutas |
| `src/lib/actions/account.ts` | Mutaciones autenticadas |
| `src/lib/cv/schema.ts` | Contrato del documento |
| `src/lib/cv/templates.ts` | Catálogo de 10 plantillas |
| `src/components/cv-layouts.tsx` | Render de cada plantilla |
| `src/components/cv-editor.tsx` | Estado del formulario, guardado, PDF |
| `src/lib/cv/pdf.ts` | Constantes A4 y export |
| `supabase/schema.sql` | Fuente de verdad de la base |
