import test from "node:test";
import assert from "node:assert/strict";
import type { ReliabilityAlert } from "@/lib/adminApi";
import {
  dedupeReliabilityAlerts,
  toNotificationRecordInput,
} from "@/app/api/admin/notifications/reliabilityIngestion";

test("dedupeReliabilityAlerts keeps latest alert per key", () => {
  const alerts: ReliabilityAlert[] = [
    {
      alertKey: "recipient-spike:1",
      type: "recipient_spike",
      severity: "high",
      title: "Recipient spike",
      description: "first",
      observedAt: "2026-03-12T09:58:00Z",
    },
    {
      alertKey: "recipient-spike:1",
      type: "recipient_spike",
      severity: "critical",
      title: "Recipient spike",
      description: "second",
      observedAt: "2026-03-12T09:59:00Z",
    },
  ];

  const deduped = dedupeReliabilityAlerts(alerts);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].severity, "critical");
});

test("toNotificationRecordInput maps alert to notification fields", () => {
  const input = toNotificationRecordInput({
    alertKey: "job-failure-burst",
    type: "job_failure_burst",
    severity: "critical",
    title: "Job failure burst",
    description: "Burst detected",
    environment: "production",
    channel: "sms",
    observedAt: "2026-03-12T09:59:00Z",
  });

  assert.equal(input.type, "reliability_alert");
  assert.match(input.link, /alert=job-failure-burst/);
  assert.match(input.message, /production/i);
});
