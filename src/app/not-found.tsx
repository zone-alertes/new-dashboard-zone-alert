import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
      <p className="type-display text-ink">404</p>
      <p className="type-small text-ink-2">Page introuvable.</p>
      <Link href="/" className="type-body-strong text-brand-strong hover:underline">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
