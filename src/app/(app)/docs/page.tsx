import type { Metadata } from "next";
import { DocsView } from "@/components/docs-view";

export const metadata: Metadata = {
  title: "Documentación",
  description:
    "Cómo está hecha CV FORGE: stack, arquitectura, datos y seguridad del creador de currículum gratis.",
  alternates: { canonical: "/docs" },
};

export default function DocsPage() {
  return <DocsView />;
}
