import test from "node:test";
import assert from "node:assert/strict";
import { adminApi } from "@/lib/adminApi";

function createJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("getCompanies maps lifecycle fields and sends IncludeDeactivated filter", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return createJsonResponse([
      {
        Id: 10,
        Name: "Archived Co",
        Industry: "Technology",
        IsCompanyVerified: false,
        IsApprovedSenderId: false,
        IsActive: false,
        DeactivatedAt: "2026-03-13T10:00:00Z",
      },
    ]);
  }) as typeof fetch;

  try {
    const companies = await adminApi.getCompanies({
      includeDeactivated: true,
      authToken: "token-1",
    });

    assert.match(requestedUrl, /IncludeDeactivated=true/);
    assert.equal(companies[0].isActive, false);
    assert.equal(companies[0].deactivatedAt, "2026-03-13T10:00:00Z");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("deactivateCompany uses proxy path and PATCH method in browser mode", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as { window?: unknown }).window;

  let requestedUrl = "";
  let requestedMethod = "";
  let requestBody = "";
  let requestHeaders: HeadersInit | undefined;

  (globalThis as { window?: unknown }).window = {
    location: { pathname: "/admin/companies/10" },
  };

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedMethod = init?.method ?? "GET";
    requestBody = String(init?.body ?? "");
    requestHeaders = init?.headers;
    return createJsonResponse({
      Id: 10,
      Name: "Archived Co",
      Industry: "Technology",
      IsCompanyVerified: false,
      IsApprovedSenderId: false,
      IsActive: false,
      DeactivatedAt: "2026-03-13T10:00:00Z",
    });
  }) as typeof fetch;

  try {
    await adminApi.deactivateCompany(10, "User requested closure");

    assert.equal(requestedMethod, "PATCH");
    assert.equal(requestedUrl, "/api/admin/proxy/Backoffice/companies/10/deactivate");
    assert.match(requestBody, /User requested closure/);
    const normalizedHeaders = new Headers(requestHeaders);
    assert.ok(normalizedHeaders.get("X-Api-Base"));
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

test("purgeCompany uses DELETE on company endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedMethod = "";

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input);
    requestedMethod = init?.method ?? "GET";
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  try {
    await adminApi.purgeCompany(99, "Compliance erasure");
    assert.equal(requestedMethod, "DELETE");
    assert.match(requestedUrl, /Backoffice\/companies\/99$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
