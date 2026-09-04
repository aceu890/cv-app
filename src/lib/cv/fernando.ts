import type { CvData } from "@/lib/cv/schema";

export const FERNANDO_CV_TITLE = "Fernando Soto · Full-Stack";
export const FERNANDO_CV_REVISION = 13;

export function createFernandoCvData(): CvData {
  return {
    template: "dossier",
    sourceRevision: FERNANDO_CV_REVISION,
    personal: {
      fullName: "Fernando Andrés Soto Gazul",
      title: "Desarrollador Full-Stack",
      email: "asd-dev@hotmail.com",
      phone: "+56 9 8546 7687",
      location: "Región de Valparaíso, Chile",
      website: "github.com/aceu890",
      linkedin: "linkedin.com/in/fernando-andres-soto-gazul",
      summary:
        "Desarrollador full-stack titulado en AIEP. Automatizé un e-commerce de carcasas a medida, armé una tienda online con inventario en Relbase, construí una app de planta para controlar moliendas de aceite de oliva y desarrollo sitios web a medida como freelancer. Trabajo con React, TypeScript, Node.js, Java Spring Boot, Python y SQL, y desarrollo con IA (ingeniería de prompts, Copilot, ChatGPT). Busco un rol full-stack junior o mid con responsabilidad sobre el ciclo completo de desarrollo.",
    },
    experience: [
      {
        id: "exp-freelance",
        company: "Independiente",
        role: "Desarrollador Web Freelance",
        location: "Chile",
        startDate: "2024-03-01",
        endDate: "",
        current: true,
        highlights: [
          "Diseñé y desarrollé páginas web a medida para clientes: sitios institucionales, landings y e-commerce, de la idea a la publicación.",
          "Me hice cargo del ciclo completo de cada proyecto: interfaz, funcionalidad, adaptación a celular y puesta en marcha.",
        ],
      },
      {
        id: "exp-inbox",
        company: "Inbox-Phone",
        role: "Desarrollador Web",
        location: "Chile",
        startDate: "2023-02-01",
        endDate: "2024-02-01",
        current: false,
        highlights: [
          "Automatizé el negocio con un configurador web de carcasas: el cliente diseñaba en la página y el pedido llegaba con foto y número de orden, listo para producir.",
          "Conecté la web con Java Spring Boot (API REST) y administré la base de datos que sostenía pedidos e inventario.",
        ],
      },
      {
        id: "exp-bycore",
        company: "Bycore",
        role: "Desarrollador Web",
        location: "Chile",
        startDate: "2022-04-01",
        endDate: "2023-01-31",
        current: false,
        highlights: [
          "Creé el e-commerce desde cero (catálogo, carrito y checkout) para que la empresa vendiera en línea.",
          "Integré Relbase a la web y sincronizé el inventario con los pedidos, evitando vender sin stock.",
          "Dejé el sitio en 99% de eficiencia de carga en celular y escritorio.",
        ],
      },
      {
        id: "exp-agro",
        company: "Agroreservas de Chile SpA",
        role: "Desarrollador Web — Planta de aceite de oliva",
        location: "San Pedro, Melipilla",
        startDate: "2019-06-01",
        endDate: "2021-02-28",
        current: false,
        highlights: [
          "Creé una aplicación web para registrar tiempos de proceso: inicio y término de moliendas y el resto de etapas de planta.",
        ],
      },
      {
        id: "exp-coca",
        company: "Coca-Cola",
        role: "Logística e inventario",
        location: "Chile",
        startDate: "2018-01-01",
        endDate: "2019-05-31",
        current: false,
        highlights: [
          "Creé un programa para que los trabajadores nuevos aprendieran la organización del trabajo y el orden de los productos en los pallets.",
        ],
      },
    ],
    education: [
      {
        id: "edu-aiep",
        school: "Instituto Profesional AIEP",
        degree: "Técnico Superior en Programación Computacional",
        location: "Chile",
        startDate: "2017-01-01",
        endDate: "2020-01-01",
        details: "",
      },
      {
        id: "edu-udemy",
        school: "Udemy",
        degree: "Formación continua en desarrollo de software",
        location: "Online",
        startDate: "2020-01-01",
        endDate: "2026-09-01",
        details:
          "Cursos de React, TypeScript, JavaScript, Java Spring Boot, Node.js, APIs REST y SQL.",
      },
      {
        id: "edu-online",
        school: "Formación online",
        degree: "Actualización profesional",
        location: "Online",
        startDate: "2024-01-01",
        endDate: "2026-09-01",
        details:
          "Ingeniería de prompts, GitHub Copilot, ChatGPT y herramientas de IA aplicadas al desarrollo.",
      },
    ],
    skills: [
      "Frontend: React, TypeScript, JavaScript",
      "Backend: Java + Spring Boot, Node.js, .NET, Python",
      "Base de datos: PostgreSQL, MySQL, SQL Server",
      "Extras: Docker, Git, AWS / Azure, APIs REST",
      "IA: ingeniería de prompts, GitHub Copilot, ChatGPT, Cursor",
    ],
    projects: [],
    languages: [
      { id: "lang-es", name: "Español", level: "Nativo" },
      { id: "lang-en", name: "Inglés", level: "B1" },
    ],
    certifications: [],
  };
}
