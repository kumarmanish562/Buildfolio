"use client";

import {
  CheckCircle2,
  CircleAlert,
  LogOut,
  Moon,
  Server,
  Sun,
  UserRound,
} from "lucide-react";

import { useTheme } from "next-themes";

import { GitHubIcon } from "@/components/icons/github-icon";

import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useBackendHealth } from "@/hooks/use-health";

export function SettingsDashboard() {
  const { data: user } = useCurrentUser();

  const logout = useLogout();

  const { theme, setTheme, resolvedTheme } = useTheme();

  const health = useBackendHealth();

  const isDark = resolvedTheme === "dark";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-6">

      {/* ============================================================
          PROFILE
      ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>

          <CardDescription>
            Your GitHub account connected to BuildFolio.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex items-center gap-4">

            <Avatar className="size-14 rounded-xl">

              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={user?.displayName ?? "User"}
              />

              <AvatarFallback className="rounded-xl">
                {(user?.displayName ?? "DP")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>

            </Avatar>

            <div className="min-w-0">

              <p className="truncate font-medium">
                {user?.displayName ?? "Unknown user"}
              </p>

              <p className="truncate text-sm text-muted-foreground">
                @{user?.githubUsername ?? "unknown"}
              </p>

            </div>

          </div>

          <Separator />

          <div className="grid gap-3 text-sm">

            {/* Display name */}

            <div className="flex items-center justify-between gap-3">

              <span className="text-muted-foreground">
                Display name
              </span>

              <span className="font-medium">
                {user?.displayName ?? "—"}
              </span>

            </div>

            {/* GitHub username */}

            <div className="flex items-center justify-between gap-3">

              <span className="text-muted-foreground">
                GitHub username
              </span>

              <span className="font-medium">
                @{user?.githubUsername ?? "—"}
              </span>

            </div>

            {/* Authentication */}

            <div className="flex items-center justify-between gap-3">

              <span className="text-muted-foreground">
                Authentication
              </span>

              <span className="inline-flex items-center gap-1.5 font-medium">

                <GitHubIcon className="size-4" />

                GitHub OAuth

              </span>

            </div>

          </div>

        </CardContent>
      </Card>

      {/* ============================================================
          APPEARANCE
      ============================================================ */}

      <Card>

        <CardHeader>

          <CardTitle>
            Appearance
          </CardTitle>

          <CardDescription>
            Customize how BuildFolio looks on your device.
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-4">

          {/* Dark mode */}

          <div className="flex items-center justify-between gap-4">

            <div className="space-y-1">

              <Label htmlFor="dark-mode">
                Dark mode
              </Label>

              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <Sun className="size-4 text-muted-foreground" />

              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />

              <Moon className="size-4 text-muted-foreground" />

            </div>

          </div>

          <Separator />

          {/* Theme selector */}

          <div className="flex items-center justify-between gap-4">

            <div className="space-y-1">

              <Label>
                Theme selector
              </Label>

              <p className="text-sm text-muted-foreground">
                Current theme: {theme ?? "system"}
              </p>

            </div>

            <ModeToggle />

          </div>

        </CardContent>

      </Card>

      {/* ============================================================
          SYSTEM STATUS
      ============================================================ */}

      <Card>

        <CardHeader>

          <CardTitle>
            System status
          </CardTitle>

          <CardDescription>
            Current BuildFolio backend connection.
          </CardDescription>

        </CardHeader>

        <CardContent>

          <div className="flex items-center justify-between rounded-xl border p-4">

            <div className="flex items-center gap-3">

              <div className="flex size-9 items-center justify-center rounded-xl bg-muted">

                <Server className="size-4" />

              </div>

              <div>

                <p className="text-sm font-medium">
                  API server
                </p>

                <p className="text-xs text-muted-foreground">
                  Spring Boot backend
                </p>

              </div>

            </div>

            {/* Health status */}

            {health.isLoading ? (

              <Badge variant="secondary">
                Checking...
              </Badge>

            ) : health.isSuccess ? (

              <Badge variant="secondary">

                <CheckCircle2 className="mr-1 size-3" />

                Operational

              </Badge>

            ) : (

              <Badge variant="destructive">

                <CircleAlert className="mr-1 size-3" />

                Offline

              </Badge>

            )}

          </div>

        </CardContent>

      </Card>

      {/* ============================================================
          ACCOUNT ACTIONS
      ============================================================ */}

      <Card>

        <CardHeader>

          <CardTitle>
            Account actions
          </CardTitle>

          <CardDescription>
            Manage your session and connected workspace.
          </CardDescription>

        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row">

          {/* GitHub */}

          <Button
            variant="outline"
            className="justify-start"
            disabled
          >

            <UserRound data-icon="inline-start" />

            Manage on GitHub

          </Button>

          {/* Logout */}

          <Button
            variant="destructive"
            className="justify-start"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >

            <LogOut data-icon="inline-start" />

            {logout.isPending
              ? "Logging out..."
              : "Log out"}

          </Button>

        </CardContent>

      </Card>

    </div>
  );
}