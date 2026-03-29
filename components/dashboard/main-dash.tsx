"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useState } from "react";

import { LogOut, Palette } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { MainDashProps } from "./main-dash-types";

export function MainDash({ country, region, city, name }: MainDashProps) {


  return (
    <Tabs defaultValue="overview" className="w-[800px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="mfa">MFA</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {name}</CardTitle>
            <CardDescription>
              Your account snapshot and preferences are all here.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            User belongs to {city}, {region}, {country}.

            <p className="text-gray-400 dark:text-gray-500 pt-5 text-xs">Geolocation is obtained from Vercel headers via Vercel Edge network.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="mfa">
        <Card>
          <CardHeader>
            <CardTitle>MFA</CardTitle>

            {false ? (
              <>
                <CardDescription>
                  MFA is disabled in this account. For full experience, enable
                  MFA.
                </CardDescription>
                <CardContent className="text-sm text-muted-foreground">
                  Page views are up 25% compared to last month.
                </CardContent>
              </>
            ) : (
              <>
                <CardDescription>
                  Well done! You have enabled MFA.
                </CardDescription>
                <CardContent className="text-sm text-muted-foreground">
                  Page views are up 25% compared to last month.
                </CardContent>
              </>
            )}
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {/* theme */}
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
      </TabsContent>
    </Tabs>
  );
}
