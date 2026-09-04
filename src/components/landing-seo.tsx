import Link from "next/link";
import { FAQ } from "@/components/json-ld";

const REASONS = [
  {
    title: "Gratis, de verdad",
    text: "CV FORGE no cobra por crear, editar ni descargar tu currículum. Es un proyecto sin fines de lucro.",
  },
  {
    title: "Sin publicidad",
    text: "Nada de banners, pop-ups ni trackers de anuncios. Solo tú y tu CV.",
  },
  {
    title: "Con o sin cuenta",
    text: "Empieza al instante en este navegador. Si quieres no perderlo, entra con Google y lo guardamos en la nube.",
  },
  {
    title: "Fácil de usar",
    text: "Elige una plantilla, rellena tus datos y exporta un PDF A4 profesional en minutos.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Entra y elige plantilla",
    text: "Once diseños distintos: clásico, consultoría, tecnología y más.",
  },
  {
    n: "02",
    title: "Escribe tu historia",
    text: "Nombre, experiencia, estudios y logros. También puedes crear con IA.",
  },
  {
    n: "03",
    title: "Descarga el PDF",
    text: "Un currículum A4 listo para enviar a empresas de cualquier país.",
  },
];

export function LandingSeo() {
  return (
    <div className="border-t border-line/80">
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          El creador de currículum gratis que no te vende nada
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Hecho para quien busca trabajo y no quiere pagar Canva, Word ni un
          editor lleno de anuncios. Crea tu CV, hoja de vida o resume y
          descárgalo hoy.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {REASONS.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.4rem] border border-line bg-cream/80 p-5"
            >
              <h3 className="font-serif text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Cómo crear un CV online en tres pasos
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.n}>
                <p className="text-xs font-medium tracking-[0.18em] text-accent">
                  {item.n}
                </p>
                <h3 className="mt-2 font-serif text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
          <Link
            href="/dashboard"
            className="mt-10 inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper"
          >
            Crear mi currículum ahora
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <dl className="mt-8 divide-y divide-line/80">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-medium">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-ink">CV FORGE</span> — creador de currículum
            gratis, sin fines de lucro y sin publicidad.
          </p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="hover:text-ink">
              Crear CV
            </Link>
            <Link href="/login" className="hover:text-ink">
              Entrar
            </Link>
            <Link href="/docs" className="hover:text-ink">
              Docs
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
