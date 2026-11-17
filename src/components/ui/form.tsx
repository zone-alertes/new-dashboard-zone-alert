"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Figma component "Champ de saisie": Label (12 Medium) + 40px box. */
export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="type-label text-ink-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="type-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="type-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

const control =
  "w-full rounded-lg border border-line-strong bg-card px-3 type-body text-ink placeholder:text-ink-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft aria-[invalid=true]:border-danger";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string; containerClassName?: string; leading?: ReactNode };

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, error, hint, id, className, containerClassName, leading, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint} className={containerClassName}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3">{leading}</span>}
        <input ref={ref} id={inputId} aria-invalid={!!error || undefined} className={cn(control, "h-10", leading && "pl-9", className)} {...props} />
      </div>
    </FieldShell>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string; containerClassName?: string };

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextArea(
  { label, error, hint, id, className, containerClassName, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint} className={containerClassName}>
      <textarea ref={ref} id={inputId} aria-invalid={!!error || undefined} className={cn(control, "min-h-[120px] resize-y py-3", className)} {...props} />
    </FieldShell>
  );
});

export function SearchInput({ placeholder, className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative w-80", className)}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input type="search" placeholder={placeholder} aria-label={placeholder} className={cn(control, "h-10 pl-9 type-small")} {...props} />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 select-none", disabled && "cursor-not-allowed opacity-60", className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-brand",
          checked ? "border-brand bg-brand" : "border-line-strong bg-card",
        )}
        aria-hidden
      >
        {checked && <Check className="size-3 text-on-brand" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

export function RadioDot({ checked }: { checked: boolean }) {
  return <span aria-hidden className={cn("size-[18px] shrink-0 rounded-full bg-card", checked ? "border-[5px] border-brand" : "border border-line-strong")} />;
}

/** Option row used by radio groups in dialogs and drawers. */
export function RadioCard({
  checked,
  onSelect,
  children,
  disabled,
  className,
  name,
  value,
}: {
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  name: string;
  value: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3",
        checked ? "border-brand bg-brand-soft" : disabled ? "border-line bg-muted" : "border-line bg-card hover:bg-page",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      <input type="radio" className="sr-only" name={name} value={value} checked={checked} disabled={disabled} onChange={onSelect} />
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "flex h-[22px] w-10 shrink-0 items-center rounded-full px-[3px] transition-colors disabled:opacity-60",
        checked ? "justify-end bg-brand" : "justify-start bg-line-strong",
      )}
    >
      <span className="size-4 rounded-full bg-card shadow-sm" />
    </button>
  );
}

/** Segmented choice (category, severity…). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  toneFor,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  toneFor?: (v: T) => { on: string };
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-lg px-3.5 type-body-strong",
              on
                ? (toneFor?.(o.value).on ?? "border border-brand bg-brand-soft text-brand-strong")
                : "border border-line-strong bg-card text-ink-2 hover:bg-page",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
