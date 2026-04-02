"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "credentials" | "otp" | "mfa";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // ✅ Check trusted IP
      const res = await fetch("/auth/check-ip");
      const { trusted } = await res.json();

      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      const currentLevel = aalData?.currentLevel ?? "aal1";
      const mfaRequired = currentLevel !== "aal2";

      if (trusted && !mfaRequired) {
        router.push("/protected");
      } else if (trusted && mfaRequired) {
        setStep("mfa");
      } else {
        const otpRes = await fetch("/auth/send-otp", { method: "POST" });

        if (!otpRes.ok) {
          const { error } = await otpRes.json();
          throw new Error(error ?? "Failed to send verification email");
        }

        setStep("otp");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;

      await fetch("/auth/trust-ip", { method: "POST" });

      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      const currentLevel = aalData?.currentLevel ?? "aal1";

      if (currentLevel !== "aal2") {
        setStep("mfa");
      } else {
        router.push("/protected");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ get factors
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) throw factorsError;
      if (!factors || !factors.totp || factors.totp.length === 0) {
        throw new Error("No authenticator found");
      }

      const totpFactor = factors.totp[0];

      // ✅ create challenge
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });

      if (challengeError) throw challengeError;
      if (!challenge) {
        throw new Error("Failed to create challenge");
      }

      // ✅ verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: otp,
      });

      if (verifyError) throw verifyError;

      router.push("/protected");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {step === "credentials" && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "otp" && (
          <>
            <CardHeader>
              <CardTitle>Verify Email</CardTitle>
              <CardDescription>Enter the code sent to {email}</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleOTPVerify}>
                <Input
                  placeholder="Enter code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button className="mt-4 w-full">
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === "mfa" && (
          <>
            <CardHeader>
              <CardTitle>Authenticator Required</CardTitle>
              <CardDescription>
                Enter code from your authenticator app
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleMFAVerify}>
                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button className="mt-4 w-full">
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
