import type { Metadata } from "next";
import { Suspense } from "react";
import { NoticeDetail } from "@/features/notices/components/notice-detail";

export const metadata: Metadata = { title: "Détail de l'avis" };

async function Detail({ params }: { params: PageProps<"/avis-de-recherche/[ref]">["params"] }) {
  const { ref } = await params;
  return <NoticeDetail noticeRef={decodeURIComponent(ref)} />;
}

export default function AvisDetailPage({ params }: PageProps<"/avis-de-recherche/[ref]">) {
  return (
    <Suspense>
      <Detail params={params} />
    </Suspense>
  );
}
