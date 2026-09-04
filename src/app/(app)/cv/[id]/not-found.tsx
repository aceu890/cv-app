import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl">No encontramos ese currículum</h1>
      <p className="mt-2 text-muted">
        Puede que lo hayas eliminado o que pertenezca a otra cuenta.
      </p>
      <Link href="/dashboard" className="mt-6 inline-block text-accent hover:underline">
        Volver al panel
      </Link>
    </div>
  );
}
