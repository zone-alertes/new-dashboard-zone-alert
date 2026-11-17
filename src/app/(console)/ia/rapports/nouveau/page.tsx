import type { Metadata } from "next";
import { ReportGenerator } from "@/features/ai/components/report-generator";

export const metadata: Metadata = { title: "Générer un rapport IA" };

export default function NouveauRapportPage() {
  return <ReportGenerator />;
}
