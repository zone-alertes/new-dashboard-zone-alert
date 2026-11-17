import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertDetail } from "@/features/alerts/components/alert-detail";

export const metadata: Metadata = { title: "Détail de l'alerte" };

async function Detail({ params }: { params: PageProps<"/alertes/[ref]">["params"] }) {
  const { ref } = await params;
  return <AlertDetail alertRef={decodeURIComponent(ref)} />;
}

export default function AlertDetailPage({ params }: PageProps<"/alertes/[ref]">) {
  return (
    <Suspense>
      <Detail params={params} />
    </Suspense>
  );
}
