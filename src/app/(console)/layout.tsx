import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";

/** Authenticated console: sidebar + top bar around every page. */
export default function ConsoleLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
