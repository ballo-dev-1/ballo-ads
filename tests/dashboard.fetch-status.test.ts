import test from "node:test";
import assert from "node:assert/strict";
import { dashboardStatsWarningMessage } from "@/app/admin/dashboard/fetchStatus";

test("dashboardStatsWarningMessage returns empty string when all sections load", () => {
  const message = dashboardStatsWarningMessage([
    { status: "fulfilled", value: {} },
    { status: "fulfilled", value: {} },
    { status: "fulfilled", value: {} },
  ]);
  assert.equal(message, "");
});

test("dashboardStatsWarningMessage returns partial warning for mixed failures", () => {
  const message = dashboardStatsWarningMessage([
    { status: "fulfilled", value: {} },
    { status: "rejected", reason: new Error("no access") },
    { status: "fulfilled", value: {} },
  ]);
  assert.equal(
    message,
    "Some dashboard sections are unavailable. Partial data is shown.",
  );
});

test("dashboardStatsWarningMessage returns full warning when all sections fail", () => {
  const message = dashboardStatsWarningMessage([
    { status: "rejected", reason: new Error("no access") },
    { status: "rejected", reason: new Error("no access") },
    { status: "rejected", reason: new Error("no access") },
  ]);
  assert.equal(message, "Unable to load dashboard stats right now.");
});
