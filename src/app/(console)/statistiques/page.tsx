import type { Metadata } from "next";
import { StatisticsView } from "@/features/statistics/components/statistics-view";

export const metadata: Metadata = { title: "Statistiques" };

export default function StatistiquesPage() {
  return <StatisticsView />;
}
