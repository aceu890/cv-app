import type { CvData } from "@/lib/cv/schema";

export const EXAMPLE_CV_TITLE = "Ejemplo · Desarrollador Full-Stack";

export function createFullStackExampleCv(): CvData {
  return {
    template: "folio",
    personal: {
      fullName: "Matías Correa Salinas",
      title: "Desarrollador Full-Stack",
      email: "matias.correa@correo.cl",
      phone: "+56 9 8765 4321",
      location: "Santiago, Chile",
      website: "github.com/mcorrea-dev",
      linkedin: "linkedin.com/in/matiascorrea",
      summary:
        "Desarrollador full-stack con 6 años construyendo productos web para logística, comercio y operaciones internas. Diseño APIs, interfaces y bases de datos con TypeScript, React y Node.js, y me enfoco en entregar software estable, medible y fácil de mantener. Busco un rol donde pueda liderar features de punta a punta y mejorar procesos en empresas industriales, portuarias o de tecnología.",
    },
    experience: [
      {
        id: "exp-nimbus",
        company: "Nimbus Labs",
        role: "Desarrollador Full-Stack",
        location: "Santiago, Chile",
        startDate: "2023-04-01",
        endDate: "",
        current: true,
        highlights: [
          "Lideré el rediseño de la plataforma de clientes, subiendo la conversión de onboarding de 41% a 63% en cuatro meses.",
          "Implementé un panel de operaciones en Next.js y PostgreSQL que redujo en 28% el tiempo de resolución de tickets.",
          "Organicé el paso de un monolito a servicios Node.js con autenticación JWT y pruebas automáticas (cobertura 82%).",
          "Mentoricé a 2 desarrolladores junior y estandaricé el flujo de code review y CI en GitHub Actions.",
        ],
      },
      {
        id: "exp-puerto",
        company: "Puerto Austral Logística",
        role: "Desarrollador de Software",
        location: "Valparaíso, Chile",
        startDate: "2021-01-15",
        endDate: "2023-03-31",
        current: false,
        highlights: [
          "Construí un sistema de tracking de contenedores usado por 120 operadores de patio y 8 clientes externos.",
          "Integré APIs de aduana y GPS, bajando los errores de digitación en un 45%.",
          "Migré reportes de Excel a un dashboard web con filtros y exportación PDF, ahorrando 10 horas semanales al equipo de administración.",
          "Di soporte de segundo nivel a usuarios internos y documenté los procedimientos de TI del área de operaciones.",
        ],
      },
      {
        id: "exp-norte",
        company: "Norte Digital",
        role: "Desarrollador Web Junior",
        location: "Santiago, Chile",
        startDate: "2019-03-01",
        endDate: "2020-12-18",
        current: false,
        highlights: [
          "Desarrollé sitios y landings en HTML, CSS y JavaScript para 15 pymes, con tiempos de carga bajo 2 segundos.",
          "Armé un backoffice en React y Firebase para una tienda, permitiendo cargar 200+ productos sin intervención técnica.",
          "Automatizé respaldos y monitoreo básico de hosting, reduciendo caídas no detectadas a casi cero.",
        ],
      },
    ],
    education: [
      {
        id: "edu-usach",
        school: "Universidad de Santiago de Chile",
        degree: "Ingeniería de Ejecución en Informática",
        location: "Santiago, Chile",
        startDate: "2015-03-01",
        endDate: "2019-12-20",
        details: "Especialidad en desarrollo de software y bases de datos.",
      },
    ],
    skills: [
      "TypeScript / JavaScript",
      "React y Next.js",
      "Node.js y Express",
      "HTML / CSS / Tailwind",
      "PostgreSQL y Prisma",
      "Flutter (apps internas)",
      "Git, GitHub Actions y Docker",
      "Soporte TI y documentación de procesos",
      "Excel avanzado para reportes operativos",
    ],
    projects: [
      {
        id: "proj-muelle",
        name: "MuelleTrack",
        description:
          "Aplicación web para seguir cargas en tiempo real desde el puerto hasta el cliente final.",
        technologies: "Next.js, Node.js, PostgreSQL, Mapbox y autenticación con Google.",
        result:
          "Pilotado con 3 exportadoras; recortó en 30% las consultas telefónicas al área de despacho.",
      },
      {
        id: "proj-caja",
        name: "CajaClara",
        description:
          "Backoffice de inventario y facturas para un taller industrial, reemplazando planillas compartidas.",
        technologies: "React, Express, PostgreSQL y generación de PDF.",
        result:
          "El cierre mensual pasó de 2 días a 3 horas y se eliminaron duplicados de SKU.",
      },
    ],
    languages: [
      { id: "lang-es", name: "Español", level: "Nativo" },
      { id: "lang-en", name: "Inglés", level: "C1" },
    ],
    certifications: [
      {
        id: "cert-aws",
        name: "AWS Cloud Practitioner",
        issuer: "Amazon Web Services",
        year: "2024",
      },
      {
        id: "cert-meta",
        name: "Meta Front-End Developer",
        issuer: "Coursera / Meta",
        year: "2023",
      },
      {
        id: "cert-sql",
        name: "SQL for Data Analysis",
        issuer: "Mode Analytics",
        year: "2022",
      },
    ],
  };
}
