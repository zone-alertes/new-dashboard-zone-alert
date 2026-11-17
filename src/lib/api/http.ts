/**
 * Transport layer. In this frontend-only build every call is resolved by the
 * in-memory mock (`src/lib/mock/db.ts`) after a small network-like latency.
 * Replace `mockRequest` with `fetch(`${API_URL}/…`)` when the backend exists:
 * hooks, stores and components do not change.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 250;

export async function mockRequest<T>(resolver: () => T, latency = LATENCY_MS): Promise<T> {
  if (latency) await new Promise((r) => setTimeout(r, latency));
  // Deep copy so that callers never mutate the mock store by accident.
  return structuredClone(resolver());
}
