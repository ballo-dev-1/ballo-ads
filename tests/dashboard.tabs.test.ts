import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDashboardTab } from "@/app/admin/dashboard/tabState";

test("normalizeDashboardTab defaults to operations", () => {
  assert.equal(normalizeDashboardTab(undefined), "operations");
  assert.equal(normalizeDashboardTab(null), "operations");
  assert.equal(normalizeDashboardTab("unknown"), "operations");
});

test("normalizeDashboardTab accepts bi tab", () => {
  assert.equal(normalizeDashboardTab("bi"), "bi");
});
