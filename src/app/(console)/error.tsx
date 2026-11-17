"use client";

import { Button } from "@/components/ui";

/** Route-level error boundary of the console (keeps the shell visible). */
export default function ConsoleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-8 py-24 text-center">
      <p className="type-h1 text-ink">Une erreur est survenue</p>
      <p className="max-w-md type-small text-ink-2">{error.message || "Le service ne répond pas. Réessayez dans quelques instants."}</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
