import type { ReactNode, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Data table matching the Figma helper: muted rounded header (40px),
 * 56px rows with bottom border. Column widths are passed per column.
 */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full table-fixed border-separate border-spacing-0 text-left">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="[&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg">{children}</thead>;
}

export function Th({ children, className, width, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { width?: number }) {
  return (
    <th
      scope="col"
      className={cn("h-10 bg-muted px-[6px] type-label font-medium text-ink-3 first:pl-4 last:pr-4", className)}
      style={width ? { width } : undefined}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tr({ children, className, onClick, selected }: { children: ReactNode; className?: string; onClick?: () => void; selected?: boolean }) {
  return (
    <tr
      onClick={onClick}
      className={cn("[&>td]:border-b [&>td]:border-line", onClick && "cursor-pointer hover:bg-page", selected && "bg-brand-soft/40", className)}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className, strong, height = 56 }: { children?: ReactNode; className?: string; strong?: boolean; height?: number }) {
  return (
    <td
      className={cn("px-[6px] align-middle first:pl-4 last:pr-4", strong ? "type-body-strong text-ink" : "type-small text-ink-2", className)}
      style={{ height }}
    >
      {children}
    </td>
  );
}

export function Pagination({ summary, page, pages, onPage }: { summary: string; page: number; pages: (number | "…")[]; onPage: (p: number) => void }) {
  const last = pages.filter((p): p is number => p !== "…").at(-1) ?? 1;
  const cell = "flex size-9 items-center justify-center rounded-lg type-body-strong";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="type-small text-ink-3">{summary}</p>
      <div className="flex gap-1.5">
        <button
          type="button"
          aria-label="Page précédente"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={cn(cell, "border border-line bg-card text-ink-2 disabled:opacity-50")}
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className={cn(cell, "text-ink-2")}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPage(p)}
              className={cn(cell, p === page ? "bg-brand text-on-brand" : "border border-line bg-card text-ink-2 hover:bg-page")}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Page suivante"
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
          className={cn(cell, "border border-line bg-card text-ink-2 disabled:opacity-50")}
        >
          ›
        </button>
      </div>
    </nav>
  );
}
