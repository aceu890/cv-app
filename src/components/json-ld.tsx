import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const FAQ = [
  {
    q: "¿CV FORGE es gratis?",
    a: "Sí. Es un proyecto sin fines de lucro: puedes crear y descargar tu currículum sin pagar.",
  },
  {
    q: "¿Necesito una cuenta de Google?",
    a: "No. Puedes entrar sin cuenta y guardar el CV en tu navegador. Google es opcional para guardarlo en la nube.",
  },
  {
    q: "¿Hay publicidad?",
    a: "No. No mostramos anuncios ni vendemos tus datos.",
  },
  {
    q: "¿Es fácil de usar?",
    a: "Sí. Eliges una plantilla, rellenas tus datos y exportas un PDF A4 listo para enviar.",
  },
  {
    q: "¿Puedo crear una hoja de vida o un resume?",
    a: "Sí. Sirve para currículum, CV, hoja de vida o resume en PDF profesional.",
  },
];

export function HomeJsonLd() {
  const site = getSiteUrl();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: site,
        inLanguage: "es",
        description: SITE_DESCRIPTION,
        potentialAction: {
          "@type": "CreateAction",
          name: "Crear currículum",
          target: `${site}/dashboard`,
        },
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: site,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: SITE_DESCRIPTION,
        inLanguage: ["es", "en"],
        featureList: [
          "Crear currículum gratis",
          "Sin publicidad",
          "Sin fines de lucro",
          "Uso con o sin cuenta",
          "Exportar CV a PDF A4",
          "11 plantillas profesionales",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export { FAQ };
