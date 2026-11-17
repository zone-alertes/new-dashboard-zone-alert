"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  zoneRisks: () => ["ai", "zone-risks"] as const,
};

export const useDashboardSummary = () => useQuery({ queryKey: dashboardKeys.summary(), queryFn: dashboardApi.summary, refetchInterval: 60_000 });
export const useZoneRisks = () => useQuery({ queryKey: dashboardKeys.zoneRisks(), queryFn: dashboardApi.zoneRisks, staleTime: 5 * 60_000 });
