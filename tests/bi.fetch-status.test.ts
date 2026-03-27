import test from "node:test";
import assert from "node:assert/strict";
import { biStatsWarningMessage } from "@/app/admin/bi-dashboard/biFetchStatus";

test("biStatsWarningMessage returns empty string when all BI calls succeed", () => {
  const message = biStatsWarningMessage([
    { status: "fulfilled", value: {} },
    { status: "fulfilled", value: {} },
  ]);

  assert.equal(message, "");
});

test("biStatsWarningMessage returns partial warning for mixed BI failures", () => {
  const message = biStatsWarningMessage([
    { status: "fulfilled", value: {} },
    { status: "rejected", reason: new Error("not available") },
  ]);

  assert.equal(message, "Some BI sections are unavailable. Partial data is shown.");
});

test("biStatsWarningMessage returns full warning when all BI calls fail", () => {
  const message = biStatsWarningMessage([
    { status: "rejected", reason: new Error("x") },
    { status: "rejected", reason: new Error("y") },
  ]);

  assert.equal(message, "Unable to load BI analytics right now.");
});
