import test from "node:test";
import assert from "node:assert/strict";
import {
  mapDispatchControlResponse,
  mapApmAlertsResponse,
  buildReliabilityNotificationPayload,
} from "@/lib/adminApi";

test("mapDispatchControlResponse normalizes PascalCase payload", () => {
  const mapped = mapDispatchControlResponse({
    Environment: "production",
    IsGloballyPaused: true,
    Channels: [
      { Channel: "Sms", IsPaused: true },
      { Channel: "Email", IsPaused: false },
    ],
    UpdatedAt: "2026-03-12T10:00:00Z",
  });

  assert.equal(mapped.environment, "production");
  assert.equal(mapped.isGloballyPaused, true);
  assert.deepEqual(mapped.channels, [
    { channel: "Sms", isPaused: true },
    { channel: "Email", isPaused: false },
  ]);
});

test("mapApmAlertsResponse maps alerts and counters", () => {
  const mapped = mapApmAlertsResponse({
    GeneratedAt: "2026-03-12T10:00:00Z",
    Counters: {
      Open: 3,
      Critical: 1,
      High: 1,
      Medium: 1,
    },
    Alerts: [
      {
        AlertKey: "recipient-spike:26097",
        Type: "recipient_spike",
        Severity: "critical",
        Title: "Recipient spike detected",
        Description: "Same recipient exceeded threshold",
        Channel: "sms",
        Environment: "production",
        ObservedAt: "2026-03-12T09:59:00Z",
      },
    ],
  });

  assert.equal(mapped.counters.open, 3);
  assert.equal(mapped.alerts[0].alertKey, "recipient-spike:26097");
  assert.equal(mapped.alerts[0].severity, "critical");
});

test("buildReliabilityNotificationPayload creates stable dedupe key", () => {
  const payload = buildReliabilityNotificationPayload({
    alertKey: "recipient-spike:26097",
    severity: "critical",
    title: "Recipient spike detected",
    description: "Same recipient exceeded threshold",
    environment: "production",
    channel: "sms",
    observedAt: "2026-03-12T09:59:00Z",
  });

  assert.equal(payload.type, "reliability_alert");
  assert.equal(payload.dedupeKey, "reliability:recipient-spike:26097");
  assert.match(payload.message, /production/i);
});
