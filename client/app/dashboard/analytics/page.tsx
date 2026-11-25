"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  CalendarDays,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/lib/api";
import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

export default function AnalyticsDashboardPage() {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["telemetry", "summary"],
    queryFn: () => api.getTelemetrySummary(),
  });

  const sampleEventMutation = useMutation({
    mutationFn: () =>
      api.trackTelemetry({
        eventName: "analytics_test_ping",
        category: "analytics",
        metadata: "Manual telemetry verification",
        durationMs: 42,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telemetry", "summary"] });
      toast.add({
        title: "Event recorded",
        description: "Telemetry ping persisted and summary refreshed.",
        type: "success",
      });
    },
    onError: (err) => {
      toast.add({
        title: "Failed to record event",
        description: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    },
  });

  const summary = summaryQuery.data;
  const topEventName = summary?.topEvents?.[0]?.eventName ?? "—";
  const activeDays =
    summary?.dailyActivity?.filter((d) => d.count > 0).length ?? 0;

  return (
    <RequireAuth>
      <AppShell
        title="Analytics & Telemetry"
        description="Anonymized usage insights, feature adoption, and activity trends."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => summaryQuery.refetch()}
              disabled={summaryQuery.isFetching}
            >
              <RefreshCw
                className={`size-3.5 ${
                  summaryQuery.isFetching ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
              Refresh
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => sampleEventMutation.mutate()}
              disabled={sampleEventMutation.isPending}
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Log Test Event
            </Button>
          </div>
        }
      >
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {/* KPI Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="gradient">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Tracked Events</CardDescription>
                  <Activity className="size-4 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl">
                  {summaryQuery.isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    (summary?.totalEvents ?? 0).toLocaleString()
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Recorded workspace interactions
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Top Feature Event</CardDescription>
                  <BarChart3 className="size-4 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="truncate text-xl font-mono">
                  {summaryQuery.isLoading ? (
                    <Skeleton className="h-8 w-36" />
                  ) : (
                    topEventName
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Most frequently triggered action
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Active Days (7d)</CardDescription>
                  <CalendarDays
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="text-2xl">
                  {summaryQuery.isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `${activeDays} / 7`
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Days with recorded telemetry
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">7-Day Activity Trend</CardTitle>
                <CardDescription>
                  Daily volume of tracked workspace events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-64 w-full rounded-xl" />
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary?.dailyActivity ?? []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => String(v).slice(5)}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Feature Events</CardTitle>
                <CardDescription>
                  Most common interactions in recent history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryQuery.isLoading ? (
                  <Skeleton className="h-64 w-full rounded-xl" />
                ) : (summary?.topEvents?.length ?? 0) === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    No telemetry events recorded yet.
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary?.topEvents ?? []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="eventName" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Telemetry Events</CardTitle>
              <CardDescription>
                Latest 15 events captured for your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (summary?.recentEvents?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Navigate around the dashboard or click &ldquo;Log Test Event&rdquo; to
                  populate telemetry.
                </p>
              ) : (
                <div className="divide-y">
                  {summary?.recentEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge variant="secondary" className="font-mono">
                          {ev.eventName}
                        </Badge>
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {ev.category}
                        </span>
                        {ev.metadata && (
                          <span className="text-muted-foreground">
                            {ev.metadata}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        {ev.durationMs !== null && <span>{ev.durationMs}ms</span>}
                        <span>
                          {new Date(ev.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
