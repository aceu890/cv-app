import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CvEditor } from "@/components/cv-editor";
import { LocalCvPage } from "@/components/local-cv-page";
import { isLocalCvId } from "@/lib/cv/local-store";
import { parseCvData } from "@/lib/cv/schema";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCachedUser } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Editor de currículum",
  robots: { index: false, follow: false },
};

type CvPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CvPage({ params }: CvPageProps) {
  const { id } = await params;

  if (isLocalCvId(id)) {
    return <LocalCvPage id={id} />;
  }

  if (!getSupabaseEnv().configured) {
    notFound();
  }

  const { supabase, user } = await getCachedUser();

  if (!user) {
    notFound();
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cv) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream/80 px-3 text-sm text-muted transition-colors hover:text-ink"
      >
        ← Tus CVs
      </Link>
      <div className="mt-5">
        <CvEditor
          cvId={cv.id}
          initialTitle={cv.title}
          initialData={parseCvData(cv.data)}
        />
      </div>
    </div>
  );
}
