import { getQueryClient } from "./query-client";

/** Drop every cached server state (used on logout so no data leaks between accounts). */
export function queryClientReset() {
  getQueryClient().clear();
}
