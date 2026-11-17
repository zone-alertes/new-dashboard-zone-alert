import type { Metadata } from "next";
import { RecommendationsView } from "@/features/ai/components/recommendations-view";

export const metadata: Metadata = { title: "Recommandations IA" };

export default function RecommandationsPage() {
  return <RecommendationsView />;
}
