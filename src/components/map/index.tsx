"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui";

/** Leaflet touches `window`: load it only in the browser. */
export const KinshasaMap = dynamic(() => import("./kinshasa-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});
export type { KinshasaMapProps } from "./kinshasa-map";
