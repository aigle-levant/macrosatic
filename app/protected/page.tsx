
import { redirect } from "next/navigation";
import { Bell, LogOut, Palette, Settings, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

function formatLastLogin(lastSignInAt?: string | null) {
  if (!lastSignInAt) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(lastSignInAt));
}

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const name =
    user.user_metadata?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "there";

  const username =
    user.user_metadata?.username ??
    user.user_metadata?.user_name ??
    user.email?.split("@")[0] ??
    "Not set";

  const email = user.email ?? "Not available";
  const lastLoggedIn = formatLastLogin(user.last_sign_in_at);

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            Protected dashboard
          </Badge>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back, {name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your account snapshot and preferences are all here.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Overview</CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hey {name}, here&apos;s the current state of your account.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-foreground px-4 py-5 text-background">
                <p className="text-xs uppercase tracking-[0.2em] text-background/70">
                  Account status
                </p>
                <p className="mt-2 text-2xl font-semibold">Active</p>
                <p className="mt-1 text-sm text-background/80">
                  Your protected dashboard is available and ready to use.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Username
                  </p>
                  <p className="mt-2 font-medium">{username}</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last login
                  </p>
                  <p className="mt-2 font-medium">{lastLoggedIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Profile</CardTitle>
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Basic account information pulled from your authenticated
                session.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="mt-1 text-base font-medium">{username}</p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 text-base font-medium">{email}</p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Last logged in</p>
                <p className="mt-1 text-base font-medium">{lastLoggedIn}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Settings</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Quick actions for appearance and session controls.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border bg-background p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Theme</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Switch between light, dark, and system mode.
                  </p>
                </div>
                <ThemeSwitcher />
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-background p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Logout</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    End the current session and return to login.
                  </p>
                </div>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
