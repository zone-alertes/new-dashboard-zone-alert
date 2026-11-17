import type { Metadata } from "next";
import { NoticeWizard } from "@/features/notices/components/notice-wizard";

export const metadata: Metadata = { title: "Publier un avis" };

export default function NouvelAvisPage() {
  return <NoticeWizard />;
}
