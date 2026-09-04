export const CV_TEMPLATES = [
  {
    id: "folio",
    name: "Harvard",
    description: "Una columna ATS, nombre centrado y viñetas",
    recommended: true,
  },
  {
    id: "atlas",
    name: "Consultoría",
    description: "Fechas a la derecha, compacto estilo banca",
  },
  {
    id: "nordico",
    name: "Londres",
    description: "Aire, chips de skills y titular destacado",
  },
  {
    id: "ejecutivo",
    name: "Dirección",
    description: "Banda navy y dos columnas en el cuerpo",
  },
  {
    id: "columna",
    name: "Europa",
    description: "Barra lateral oscura con contacto y skills",
  },
  {
    id: "academia",
    name: "Académico",
    description: "Educación primero, serif de investigación",
  },
  {
    id: "tecnico",
    name: "Tecnología",
    description: "Línea de tiempo y proyectos en tarjetas",
  },
  {
    id: "metro",
    name: "Corporativo",
    description: "Cabecera partida y barra de acento",
  },
  {
    id: "aurora",
    name: "Editorial",
    description: "Nombre grande y cuerpo en dos columnas",
  },
  {
    id: "terra",
    name: "Chile",
    description: "Papel cálido, perfil recuadrado y pie en grid",
  },
  {
    id: "dossier",
    name: "Dossier",
    description: "Barra navy, acento teal y viñetas ▸",
  },
] as const;

export type CvTemplateId = (typeof CV_TEMPLATES)[number]["id"];

export const DEFAULT_TEMPLATE: CvTemplateId = "folio";

const TEMPLATE_IDS = new Set<string>(CV_TEMPLATES.map((item) => item.id));

export function parseTemplateId(value: unknown): CvTemplateId {
  return typeof value === "string" && TEMPLATE_IDS.has(value)
    ? (value as CvTemplateId)
    : DEFAULT_TEMPLATE;
}

export function getTemplate(id: CvTemplateId) {
  return CV_TEMPLATES.find((item) => item.id === id) ?? CV_TEMPLATES[0];
}
