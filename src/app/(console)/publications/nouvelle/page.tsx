import type { Metadata } from "next";
import { PublicationForm } from "@/features/publications/components/publication-form";

export const metadata: Metadata = { title: "Nouvelle publication" };

export default function NouvellePublicationPage() {
  return <PublicationForm />;
}
