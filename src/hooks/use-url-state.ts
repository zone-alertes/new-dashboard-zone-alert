"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { z } from "zod";

/**
 * URL-as-state: filters, tabs and pagination live in the query string so they
 * survive reloads, can be shared as links and work with back/forward.
 * Values are parsed (and defaulted) by a zod schema.
 */
export function useUrlState<S extends z.ZodType<Record<string, unknown>>>(schema: S) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(() => schema.parse(Object.fromEntries(params.entries())) as z.infer<S>, [params, schema]);

  const setState = useCallback(
    (patch: Partial<Record<keyof z.infer<S>, string | number | string[] | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        const v = Array.isArray(value) ? value.join(",") : value;
        if (v === null || v === undefined || v === "") next.delete(key);
        else next.set(key, String(v));
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return [state, setState] as const;
}
