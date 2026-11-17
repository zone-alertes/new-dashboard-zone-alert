import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertsView } from "@/features/alerts/components/alerts-view";

export const metadata: Metadata = { title: "Alertes" };

export default function AlertesPage() {
  return (
    <Suspense>
      <AlertsView />
    </Suspense>
  );
}
