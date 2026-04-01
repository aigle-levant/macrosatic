"use client";

import { useState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MFASettings() {
  const [enabled, setEnabled] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);

    const res = await fetch("/auth/mfa/enroll", {
      method: "POST",
    });

    const data = await res.json();
    console.log("RESPONSE:", data);

    setQr(data.qr);
    setFactorId(data.factorId);
    setLoading(false);
  };

  const handleChallenge = async () => {
    const res = await fetch("/auth/mfa/challenge", {
      method: "POST",
      body: JSON.stringify({ factorId }),
    });

    const data = await res.json();
    setChallengeId(data.challengeId);
  };

  const handleVerify = async () => {
    const res = await fetch("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({
        factorId,
        challengeId,
        code,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setEnabled(true);
      setQr(null);
      alert("MFA Enabled 🎉");
    } else {
      alert("Invalid code");
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>MFA</CardTitle>

        {!enabled ? (
          <>
            <CardDescription>
              Secure your account with an authenticator app (TOTP).
            </CardDescription>
          </>
        ) : (
          <>
            <CardDescription className="text-green-600">
              MFA is enabled on your account.
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!enabled && !qr && (
          <Button onClick={handleEnroll} disabled={loading}>
            {loading ? "Generating..." : "Enable MFA"}
          </Button>
        )}

        {qr && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Scan this QR code using Google Authenticator or Microsoft
              Authenticator.
            </p>

            <div
              className="border p-2 inline-block rounded"
              dangerouslySetInnerHTML={{ __html: qr }}
            />

            <Button onClick={handleChallenge} variant="secondary">
              Continue
            </Button>
          </div>
        )}

        {challengeId && (
          <div className="space-y-2">
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Button onClick={handleVerify} className="w-full">
              Verify & Enable
            </Button>
          </div>
        )}

        {enabled && (
          <div className="text-sm text-muted-foreground">
            Your account is protected with multi-factor authentication.
          </div>
        )}
      </CardContent>
    </>
  );
}
