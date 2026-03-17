import test from "node:test";
import assert from "node:assert/strict";
import type { ApmAlertsResponse, DispatchControlResponse } from "@/lib/adminApi";
import {
  buildDashboardReliabilitySummary,
  dashboardApmRouteForPathname,
} from "@/app/admin/dashboard/reliabilitySummary";

test("buildDashboardReliabilitySummary computes paused channels and latest incident", () => {
  const alerts: ApmAlertsResponse = {
    generatedAt: "2026-03-12T10:00:00Z",
    counters: { open: 2, critical: 1, high: 1, medium: 0 },
    alerts: [
      {
        alertKey: "job-failure-burst",
        type: "job_failure_burst",
        severity: "critical",
        title: "Job failure burst",
        description: "Many jobs failed in short interval",
        environment: "production",
        channel: "sms",
        observedAt: "2026-03-12T09:59:00Z",
      },
    ],
  };

  const controls: DispatchControlResponse = {
    environment: "production",
    isGloballyPaused: false,
    updatedAt: "2026-03-12T10:00:00Z",
    channels: [
      { channel: "Sms", isPaused: true },
      { channel: "Email", isPaused: false },
    ],
  };

  const summary = buildDashboardReliabilitySummary(alerts, controls);
  assert.equal(summary.activeAlertsCount, 2);
  assert.equal(summary.pausedChannelsCount, 1);
  assert.equal(summary.latestIncidentSeverity, "critical");
});

test("dashboardApmRouteForPathname maps admin namespaces", () => {
  assert.equal(dashboardApmRouteForPathname("/admin/dashboard"), "/admin/apm");
  assert.equal(dashboardApmRouteForPathname("/dev-admin/dashboard"), "/dev-admin/apm");
  assert.equal(
    dashboardApmRouteForPathname("/staging-admin/dashboard"),
    "/staging-admin/apm",
  );
});
