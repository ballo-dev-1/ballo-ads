import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTopicName } from "@/lib/firebase/topic";

test("normalizeTopicName lowercases and sanitizes", () => {
  const normalized = normalizeTopicName(" Backoffice Admins ");
  assert.equal(normalized, "backoffice-admins");
});

test("normalizeTopicName strips unsupported characters", () => {
  const normalized = normalizeTopicName("TEAM@Ballo#2026!");
  assert.equal(normalized, "teamballo2026");
});

test("normalizeTopicName falls back when empty", () => {
  const normalized = normalizeTopicName("!!!", "fallback-topic");
  assert.equal(normalized, "fallback-topic");
});
