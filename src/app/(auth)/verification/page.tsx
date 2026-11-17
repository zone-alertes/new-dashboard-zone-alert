import type { Metadata } from "next";
import { Suspense } from "react";
import { OtpForm } from "@/features/auth/components/otp-form";

export const metadata: Metadata = { title: "Vérification en deux étapes" };

export default function VerificationPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
