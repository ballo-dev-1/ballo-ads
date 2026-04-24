import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRules } from "@/lib/crmStore";

test("evaluateRules filters clients correctly", () => {
  const clients = [
    {
      id: "1",
      companyName: "A",
      industry: "Insurance",
      region: "Lusaka",
      balloadsAccountId: "a",
      planTier: "Pro" as const,
      accountStatus: "active" as const,
      healthScore: 30,
      creditsRemaining: 100,
      lastActiveAt: null,
      signedUpAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    },
    {
      id: "2",
      companyName: "B",
      industry: "Retail",
      region: "Lusaka",
      balloadsAccountId: "b",
      planTier: "Standard" as const,
      accountStatus: "active" as const,
      healthScore: 80,
      creditsRemaining: 200,
      lastActiveAt: null,
      signedUpAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    },
  ];

  const results = evaluateRules(clients, [{ attr: "health_score", op: "<", val: "40" }]);
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "1");
});
