import type { Metadata } from "next";
import { LiveMapView } from "@/features/live-map/components/live-map-view";

export const metadata: Metadata = { title: "Carte en direct" };

export default function CartePage() {
  return <LiveMapView />;
}
