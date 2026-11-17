import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="type-caption text-ink-3">Zone Alerte © 2026 · Données protégées · Confidentialité</p>
    </>
  );
}
