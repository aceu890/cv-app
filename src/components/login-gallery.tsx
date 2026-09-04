import Image from "next/image";

export function LoginGallery() {
  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[2.2rem] bg-accent/10 blur-3xl" />
      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-[1.15fr_0.85fr]">
        <figure className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line/70 shadow-[var(--shadow)] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:min-h-[520px]">
          <Image
            src="/login/hero.png"
            alt="Profesional revisando su currículum en un escritorio con luz natural"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover"
            preload
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pt-16 pb-4 text-sm text-white">
            El momento en que tu CV deja de ser un archivo y empieza a
            trabajar por ti.
          </figcaption>
        </figure>

        <figure className="relative aspect-square overflow-hidden rounded-[1.3rem] border border-line/70 shadow-[var(--shadow)]">
          <Image
            src="/login/portrait.png"
            alt="Candidato sonriendo con confianza antes de una entrevista"
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover"
          />
        </figure>

        <figure className="relative min-h-[140px] overflow-hidden rounded-[1.3rem] border border-line/70 shadow-[var(--shadow)] sm:min-h-[220px]">
          <Image
            src="/login/desk.png"
            alt="Escritorio con currículum impreso, portátil y café listos para postular"
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pt-10 pb-3 text-xs text-white">
            De la idea al PDF, en una sentada.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
