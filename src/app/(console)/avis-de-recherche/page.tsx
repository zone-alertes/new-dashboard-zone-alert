import type { Metadata } from "next";
import { Suspense } from "react";
import { NoticesView } from "@/features/notices/components/notices-view";

export const metadata: Metadata = { title: "Avis de recherche" };

export default function AvisPage() {
  return (
    <Suspense>
      <NoticesView />
    </Suspense>
  );
}
