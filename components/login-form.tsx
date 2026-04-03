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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Step 1: login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // ✅ Step 2: check IP
      const res = await fetch("/api/auth/check-ip");
      const { trusted } = await res.json();

      if (!trusted) {
        // 🔥 magic link flow (no manual input needed)
        await fetch("/api/auth/send-otp", { method: "POST" });

        throw new Error(
          "New device detected. Check your email for verification link.",
        );
      }

      // ✅ Step 3: check MFA requirement
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      const currentLevel = aalData?.currentLevel ?? "aal1";

      // 🔥 If MFA required → verify using input field
      if (currentLevel !== "aal2") {
        const { data: factors, error: factorsError } =
          await supabase.auth.mfa.listFactors();

        if (factorsError) throw factorsError;
        if (!factors || factors.totp.length === 0) {
          throw new Error("MFA not set up properly");
        }

        const factor = factors.totp[0];

         if (!mfaCode) {
           await supabase.auth.mfa.challenge({
             factorId: factor.id,
           });

           throw new Error("Enter authenticator code");
         }

        const { data: challenge, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId: factor.id,
          });

        if (challengeError) throw challengeError;
        if (!challenge) throw new Error("Challenge failed");

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId: factor.id,
          challengeId: challenge.id,
          code: mfaCode,
        });

        if (verifyError) {
          throw new Error("Invalid authenticator code");
        }
      }

      // ✅ Success
      router.push("/protected");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Login with email, password and authenticator (if enabled)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* 🔥 ALWAYS VISIBLE MFA FIELD */}
              <div>
                <Label>Authenticator Code (if enabled)</Label>
                <Input
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.trim())}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
