import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge aware of our custom `type-*` text style utilities. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["type-display", "type-h1", "type-h2", "type-h3", "type-body", "type-body-strong", "type-small", "type-caption", "type-label", "type-kpi"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
