import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEmergencyControlMatrix,
  summarizeReliabilityAlerts,
  applyChannelPauseToggle,
} from "@/app/admin/apm/reliabilityViewModel";
import type { ApmAlertsResponse, DispatchControlResponse } from "@/lib/adminApi";

const dispatchFixture: DispatchControlResponse = {
  environment: "production",
  isGloballyPaused: false,
  updatedAt: "2026-03-12T10:00:00Z",
  channels: [
    { channel: "Sms", isPaused: false },
    { channel: "Email", isPaused: true },
    { channel: "WhatsApp", isPaused: false },
  ],
};

const alertsFixture: ApmAlertsResponse = {
  generatedAt: "2026-03-12T10:00:00Z",
  counters: {
    open: 3,
    critical: 1,
    high: 1,
    medium: 1,
  },
  alerts: [
    {
      alertKey: "recipient-spike:26097",
      type: "recipient_spike",
      severity: "critical",
      title: "Recipient spike detected",
      description: "Same recipient exceeded threshold",
      environment: "production",
      channel: "sms",
      observedAt: "2026-03-12T09:59:00Z",
      acknowledged: false,
    },
    {
      alertKey: "retry-spike:sms",
      type: "retry_spike",
      severity: "high",
      title: "Retry spike detected",
      description: "Retry volume exceeded threshold",
      environment: "production",
      channel: "sms",
      observedAt: "2026-03-12T09:58:00Z",
      acknowledged: false,
    },
  ],
};

test("buildEmergencyControlMatrix returns global + sorted channels", () => {
  const matrix = buildEmergencyControlMatrix(dispatchFixture);
  assert.equal(matrix.environment, "production");
  assert.equal(matrix.global.isPaused, false);
  assert.equal(matrix.channels[0].channel, "Email");
  assert.equal(matrix.channels[0].isPaused, true);
});

test("summarizeReliabilityAlerts computes headline and top critical", () => {
  const summary = summarizeReliabilityAlerts(alertsFixture);
  assert.equal(summary.openCount, 3);
  assert.equal(summary.headlineSeverity, "critical");
  assert.equal(summary.topAlerts[0].alertKey, "recipient-spike:26097");
});

test("applyChannelPauseToggle updates one channel only", () => {
  const next = applyChannelPauseToggle(dispatchFixture, "Sms", true);
  const sms = next.channels.find((c) => c.channel === "Sms");
  const email = next.channels.find((c) => c.channel === "Email");
  assert.equal(sms?.isPaused, true);
  assert.equal(email?.isPaused, true);
});
