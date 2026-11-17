import type { Metadata } from "next";
import { PredictionsView } from "@/features/ai/components/predictions-view";

export const metadata: Metadata = { title: "Prédictions IA" };

export default function PredictionsPage() {
  return <PredictionsView />;
}
