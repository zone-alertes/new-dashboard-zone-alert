"use client";

import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "./api";

export const statisticsKeys = {
  all: ["statistics"] as const,
  monthly: (period: string) => [...statisticsKeys.all, period] as const,
};

export const useStatistics = (period: string) =>
  useQuery({ queryKey: statisticsKeys.monthly(period), queryFn: () => statisticsApi.monthly(period), staleTime: 10 * 60_000 });
