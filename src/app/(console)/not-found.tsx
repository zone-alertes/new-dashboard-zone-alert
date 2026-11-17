import { ButtonLink } from "@/components/ui";

export default function ConsoleNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-24 text-center">
      <p className="type-display text-ink">Page introuvable</p>
      <p className="type-small text-ink-2">Cette page n&apos;existe pas ou a été déplacée.</p>
      <ButtonLink href="/tableau-de-bord">Retour au tableau de bord</ButtonLink>
    </div>
  );
}
