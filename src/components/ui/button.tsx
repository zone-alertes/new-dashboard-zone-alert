import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Figma component "Bouton" — variants Type=Primaire | Secondaire | Discret | Danger. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong",
  secondary: "bg-card text-ink border border-line-strong hover:bg-muted",
  ghost: "text-ink-2 hover:bg-muted hover:text-ink",
  danger: "bg-danger text-on-brand hover:brightness-95",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 type-body-strong whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Shows the leading "+" icon ("Icône visible" in Figma) or a custom icon. */
  icon?: boolean | ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", icon, loading, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClasses(variant, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {icon === true ? <Plus className="size-[18px]" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  icon,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  icon?: boolean | ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {icon === true ? <Plus className="size-[18px]" aria-hidden /> : icon}
      {children}
    </Link>
  );
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn("inline-flex size-10 items-center justify-center rounded-lg border border-line-strong text-ink-2 hover:bg-muted", className)}
      {...props}
    >
      {children}
    </button>
  );
}
