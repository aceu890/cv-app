import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PublicCvView } from "@/components/public-cv-view";
import { parseCvData } from "@/lib/cv/schema";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadShare(slug: string) {
  if (!getSupabaseEnv().configured) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("public_shares")
      .select("title, payload")
      .eq("slug", slug)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const share = await loadShare(slug);
  if (!share) return { title: "Currículum" };
  const cv = parseCvData(share.payload);
  const name = cv.personal.fullName || share.title;
  return {
    title: `${name} — CV`,
    description: cv.personal.summary || share.title,
    alternates: { canonical: `${getSiteUrl()}/u/${slug}` },
  };
}

export default async function PublicCvPage({ params }: PageProps) {
  const { slug } = await params;
  const share = await loadShare(slug);
  if (!share) notFound();

  const data = parseCvData(share.payload);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line/80 bg-paper/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <BrandLogo href="/" size="sm" />
          <Link
            href="/dashboard"
            className="rounded-full bg-solid px-4 py-2 text-sm text-on-solid"
          >
            Crear el mío
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          Currículum público
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          {data.personal.fullName || share.title}
        </h1>
        {data.personal.title ? (
          <p className="mt-1 text-muted">{data.personal.title}</p>
        ) : null}
        <div className="mt-6">
          <PublicCvView title={share.title} data={data} />
        </div>
      </main>
    </div>
  );
}
