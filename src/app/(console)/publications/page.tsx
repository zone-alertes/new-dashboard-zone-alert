import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicationsView } from "@/features/publications/components/publications-view";

export const metadata: Metadata = { title: "Publications" };

export default function PublicationsPage() {
  return (
    <Suspense>
      <PublicationsView />
    </Suspense>
  );
}
