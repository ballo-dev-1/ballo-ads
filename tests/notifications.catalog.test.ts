import test from "node:test";
import assert from "node:assert/strict";
import {
  buildNotificationFromEvent,
  shouldDispatchPushForSeverity,
  shouldSkipDueToCooldown,
} from "@/lib/notifications/catalog";

test("buildNotificationFromEvent maps campaign approval request", () => {
  const event = buildNotificationFromEvent("campaign_approval_request", {
    campaignId: 23,
    companyId: 5,
    campaignName: "Flash Sale",
  });

  assert.equal(event.type, "campaign_approval_request");
  assert.equal(event.category, "moderation");
  assert.equal(event.severity, "high");
  assert.match(event.link ?? "", /companies\/5\/campaigns\/23/);
  assert.deepEqual(event.targetRoles.sort(), ["admin", "super_admin"]);
});

test("shouldDispatchPushForSeverity true for high/critical only", () => {
  assert.equal(shouldDispatchPushForSeverity("critical"), true);
  assert.equal(shouldDispatchPushForSeverity("high"), true);
  assert.equal(shouldDispatchPushForSeverity("warning"), false);
  assert.equal(shouldDispatchPushForSeverity("info"), false);
});

test("shouldSkipDueToCooldown respects cooldown window", () => {
  const now = new Date("2026-03-26T12:00:00.000Z");
  const createdAt = new Date("2026-03-26T11:55:30.000Z");
  assert.equal(shouldSkipDueToCooldown(createdAt, 240, now), false);
  assert.equal(shouldSkipDueToCooldown(createdAt, 600, now), true);
});
