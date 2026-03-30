/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Step = "qr" | "verify" | "success";

export default function Mfa() {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("qr");
  const [factorId, setFactorId] = useState("");
  const [qr, setQR] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Start enrollment as soon as the dialog opens
  useEffect(() => {
    if (!open) return;
    setStep("qr");
    setVerifyCode("");
    setError("");

    (async () => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error) {
        setError(error.message);
        return;
      }
      setFactorId(data.id);
      setQR(data.totp.qr_code); // SVG data URL
      setSecret(data.totp.secret); // fallback manual entry
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });

    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setStep("success");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Get started</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        {/* ── Step 1: Show QR code ── */}
        {step === "qr" && (
          <>
            <DialogHeader>
              <DialogTitle>Setup MFA for your account</DialogTitle>
              <DialogDescription>
                Scan the QR code below with your authenticator app (Google
                Authenticator, Authy, etc.), then click Next.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3 py-2">
              {qr ? (
                <img src={qr} alt="MFA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-muted animate-pulse rounded-md" />
              )}
              {secret && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Can&apos;t scan? Enter this code manually:
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                    {secret}
                  </code>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={() => setStep("verify")} disabled={!qr}>
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 2: Enter verification code ── */}
        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle>Verify your authenticator</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code shown in your authenticator app to
                confirm setup.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <Label htmlFor="totp-code">One-time code</Label>
                <Input
                  id="totp-code"
                  name="totp-code"
                  placeholder="000000"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.trim())}
                />
              </Field>
            </FieldGroup>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("qr")}>
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verifyCode.length !== 6 || loading}
              >
                {loading ? "Verifying..." : "Enable MFA"}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>MFA Enabled 🎉</DialogTitle>
              <DialogDescription>
                Your account is now protected with two-factor authentication.
                You&apos;ll be asked for a code each time you log in.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
