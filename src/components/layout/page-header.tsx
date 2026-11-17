import type { ReactNode } from "react";

/** Page title block used by every console screen: H1 + subtitle, actions on the right. */
export function PageHeader({ title, subtitle, actions, leading }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; leading?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex items-center gap-4">
        {leading}
        <div className="flex flex-col gap-1">
          <h1 className="type-h1 text-ink">{title}</h1>
          {subtitle && <p className="type-small text-ink-2">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}

/** Content area: px 32, py 28, vertical gap 24 (Figma "Contenu"). */
export function PageContent({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6 px-8 py-7">{children}</div>;
}
