import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CvEditor } from "@/components/cv-editor";
import { parseCvData } from "@/lib/cv/schema";
import { createClient } from "@/lib/supabase/server";

type CvPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CvPage({ params }: CvPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

  const initialData = parseCvData(cv.data);

  return (
    <div>
      <Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
        ← Volver a tus CVs
      </Link>
      <div className="mt-6">
        <CvEditor
          cvId={cv.id}
          initialTitle={cv.title}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
