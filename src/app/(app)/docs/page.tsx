import type { Metadata } from "next";
import { DocsView } from "@/components/docs-view";

export const metadata: Metadata = {
  title: "Docs — Folio",
  description:
    "Technical documentation for Folio: stack, architecture, data model, and security.",
};

export default function DocsPage() {
  return <DocsView />;
}
