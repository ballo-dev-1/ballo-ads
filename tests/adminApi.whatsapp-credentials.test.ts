import test from "node:test";
import assert from "node:assert/strict";
import { adminApi } from "@/lib/adminApi";

test("getCompanyWhatsAppCredentials targets Backoffice path and isTestKey query (server fetch)", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify({
        Id: 1,
        CompanyId: 42,
        IsTestKey: true,
        IsActive: true,
        PhoneNumberId: "pn",
        AccessTokenConfigured: true,
        UsesPlatformDefaults: false,
        CreatedAt: "2026-01-01T00:00:00Z",
        UpdatedAt: "2026-01-01T00:00:00Z",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const row = await adminApi.getCompanyWhatsAppCredentials(42, true, "tok-1");
    assert.match(requestedUrl, /\/Backoffice\/companies\/42\/whatsapp-credentials/);
    assert.match(requestedUrl, /isTestKey=true/);
    assert.equal(row.companyId, 42);
    assert.equal(row.isTestKey, true);
    assert.equal(row.phoneNumberId, "pn");
    assert.equal(row.usesPlatformDefaults, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCompanyWhatsAppCredentials maps UsesPlatformDefaults when API returns synthetic row", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({
        Id: 0,
        CompanyId: 99,
        IsTestKey: false,
        IsActive: true,
        PhoneNumberId: "platform-pn",
        UsesPlatformDefaults: true,
        AccessTokenConfigured: true,
        CreatedAt: "2026-01-01T00:00:00Z",
        UpdatedAt: "2026-01-01T00:00:00Z",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const row = await adminApi.getCompanyWhatsAppCredentials(99, false, "tok");
    assert.equal(row.usesPlatformDefaults, true);
    assert.equal(row.phoneNumberId, "platform-pn");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("upsertCompanyWhatsAppCredentials sends PUT with JSON body", async () => {
  const originalFetch = globalThis.fetch;
  let requestedMethod = "";
  let requestBody = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestedMethod = init?.method ?? "GET";
    requestBody = String(init?.body ?? "");
    return new Response(
      JSON.stringify({
        Id: 2,
        CompanyId: 7,
        IsTestKey: false,
        IsActive: true,
        PhoneNumberId: "new-pn",
        AccessTokenConfigured: false,
        UsesPlatformDefaults: false,
        CreatedAt: "2026-01-01T00:00:00Z",
        UpdatedAt: "2026-01-01T00:00:00Z",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    await adminApi.upsertCompanyWhatsAppCredentials(
      7,
      {
        isTestKey: false,
        isActive: true,
        phoneNumberId: "new-pn",
      },
      "tok-2",
    );
    assert.equal(requestedMethod, "PUT");
    assert.ok(requestBody.includes("new-pn"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("testCompanyWhatsAppCredentials POSTs test endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let requestedMethod = "";
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedMethod = init?.method ?? "GET";
    return new Response(JSON.stringify({ Ok: true, Message: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const r = await adminApi.testCompanyWhatsAppCredentials(3, false, "tok-3");
    assert.equal(requestedMethod, "POST");
    assert.match(requestedUrl, /whatsapp-credentials\/test/);
    assert.equal(r.ok, true);
    assert.equal(r.message, "ok");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("deactivateCompanyWhatsAppCredentials sends DELETE", async () => {
  const originalFetch = globalThis.fetch;
  let requestedMethod = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestedMethod = init?.method ?? "GET";
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  try {
    await adminApi.deactivateCompanyWhatsAppCredentials(9, true, "tok-4");
    assert.equal(requestedMethod, "DELETE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getBackofficeCompanyWhatsAppTemplateCatalog targets Backoffice path and maps PascalCase rows", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(
      JSON.stringify([
        {
          Name: "hello_world",
          Language: "en_US",
          Category: "MARKETING",
          Status: "APPROVED",
          Components: [{ type: "BODY", text: "Hi {{1}}" }],
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const list = await adminApi.getBackofficeCompanyWhatsAppTemplateCatalog(5, {
      isTestKey: true,
      category: "marketing",
      authToken: "tok-cat",
    });
    assert.match(requestedUrl, /\/Backoffice\/companies\/5\/whatsapp\/templates/);
    assert.match(requestedUrl, /isTestKey=true/);
    assert.match(requestedUrl, /category=marketing/);
    assert.equal(list.length, 1);
    assert.equal(list[0]?.name, "hello_world");
    assert.equal(list[0]?.language, "en_US");
    assert.equal(list[0]?.category, "MARKETING");
    assert.equal(list[0]?.status, "APPROVED");
    assert.deepEqual(list[0]?.components, [{ type: "BODY", text: "Hi {{1}}" }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCompanyWhatsAppTemplateCatalog targets v1 path and query flags", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await adminApi.getCompanyWhatsAppTemplateCatalog(12, {
      useTestCredentialSlot: true,
      category: "utility",
    });
    assert.match(requestedUrl, /v1\/companies\/12\/whatsapp\/templates/);
    assert.match(requestedUrl, /useTestCredentialSlot=true/);
    assert.match(requestedUrl, /category=utility/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
