import test from "node:test";
import assert from "node:assert/strict";
import { adminApi } from "@/lib/adminApi";

test("allocateCompanyApiCredits POSTs JSON body to Backoffice allocate path", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedMethod = "";
  let requestBody = "";

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedMethod = init?.method ?? "GET";
    requestBody = String(init?.body ?? "");
    return new Response(
      JSON.stringify({
        Id: 501,
        Company: { Id: 42, Name: "Acme" },
        SmsCount: 100,
        EmailCount: 0,
        WhatsAppCount: 0,
        WhatsAppUtilityCount: 0,
        BilledAccount: "MANUAL_ALLOCATION",
        PurchaseOrderStatus: "Active",
        PurchaseOrderType: "ManualAllocation",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    await adminApi.allocateCompanyApiCredits(
      42,
      {
        smsCount: 100,
        emailCount: 0,
        whatsAppCount: 0,
        whatsAppUtilityCount: 0,
        notes: "Pilot top-up",
        durationDays: 45,
      },
      "token-xyz",
    );

    assert.equal(requestedMethod, "POST");
    assert.match(requestedUrl, /Backoffice\/companies\/42\/api-credits\/allocate$/);
    const body = JSON.parse(requestBody) as Record<string, unknown>;
    assert.equal(body.smsCount, 100);
    assert.equal(body.emailCount, 0);
    assert.equal(body.whatsAppCount, 0);
    assert.equal(body.whatsAppUtilityCount, 0);
    assert.equal(body.notes, "Pilot top-up");
    assert.equal(body.durationDays, 45);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
