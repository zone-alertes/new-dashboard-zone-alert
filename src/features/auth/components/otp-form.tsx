"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lock, Shield } from "lucide-react";
import { Button, Callout } from "@/components/ui";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";
import { authApi } from "../api";
import { otpSchema } from "../schemas";

const LENGTH = 6;

/** Screen 1.2 — Vérification en deux étapes (6 boxes, paste support, resend countdown). */
export function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const status = useSessionStore((s) => s.status);
  const otpTarget = useSessionStore((s) => s.otpTarget);
  const complete = useSessionStore((s) => s.completeTwoFactor);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(42);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === "anonymous") router.replace("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      complete();
      router.replace(params.get("redirect") ?? "/tableau-de-bord");
    },
    onError: (e) => setError(e.message),
  });

  const setAt = (i: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, j) => (j === i ? "" : x)));
      return;
    }
    const next = [...digits];
    clean
      .split("")
      .slice(0, LENGTH - i)
      .forEach((c, k) => (next[i + k] = c));
    setDigits(next);
    setError(null);
    refs.current[Math.min(i + clean.length, LENGTH - 1)]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ code: digits.join("") });
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    verify.mutate(parsed.data.code);
  };

  return (
    <form onSubmit={submit} noValidate className="flex w-[460px] max-w-full flex-col gap-6 rounded-xl border border-line bg-card p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <Lock className="size-[26px]" aria-hidden />
        </span>
        <h1 className="type-h1 text-ink">Vérification en deux étapes</h1>
        <p className="max-w-[380px] type-small text-ink-2">Saisissez le code à 6 chiffres envoyé par SMS au {otpTarget ?? "+243 81 ••• •• 47"}.</p>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Code de vérification</legend>
        <div className="flex justify-center gap-2.5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={i === 0}
              maxLength={LENGTH}
              aria-label={`Chiffre ${i + 1}`}
              aria-invalid={!!error || undefined}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && refs.current[i - 1]?.focus()}
              className={cn(
                "h-[60px] w-[52px] rounded-lg border bg-card text-center type-h1 text-ink outline-none focus:border-2 focus:border-brand",
                error ? "border-danger" : "border-line-strong",
              )}
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="text-center type-small text-danger">
            {error}
          </p>
        )}
      </fieldset>
      <Button type="submit" loading={verify.isPending} className="w-full">
        Vérifier et continuer
      </Button>
      <div className="flex items-center justify-between">
        {seconds > 0 ? (
          <span className="type-small text-ink-3">Renvoyer le code dans 0:{String(seconds).padStart(2, "0")}</span>
        ) : (
          <button
            type="button"
            className="type-body-strong text-brand-strong hover:underline"
            onClick={async () => {
              await authApi.resendOtp();
              setSeconds(60);
              toast("Nouveau code envoyé par SMS", { tone: "info" });
            }}
          >
            Renvoyer le code
          </button>
        )}
        <button
          type="button"
          onClick={() => toast("Saisissez l'un de vos 10 codes de secours.", { tone: "info" })}
          className="type-body-strong text-brand-strong hover:underline"
        >
          Utiliser un code de secours
        </button>
      </div>
      <Callout tone="neutral" icon={<Shield aria-hidden />} className="p-3">
        La double authentification est obligatoire pour les rôles Administrateur et Service de sécurité.
      </Callout>
    </form>
  );
}
