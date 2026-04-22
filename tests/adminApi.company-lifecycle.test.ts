/** Roadmap: admin UI completeness only; no product roadmap row. */
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

test("getCompanyCampaignsAll maps recipients and delivery statuses", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    return createJsonResponse([
      {
        Id: 42,
        Name: "Campaign A",
        CampaignMessage: "Hello",
        CampaignPurpose: "SmsAdvert",
        CampaignChannel: "Sms",
        CompanyId: 7,
        CreatorId: 9,
        StartDate: "2026-03-20T10:00:00Z",
        EndDate: "2026-03-21T10:00:00Z",
        Status: "Active",
        IsApproved: true,
        Recipients: [
          {
            Id: 1,
            Account: "260961000001",
            Channel: "Sms",
            MessageDispatched: true,
            Status: "Sent",
            AttemptCount: 1,
          },
          {
            Id: 2,
            Account: "260771000001",
            Channel: "Sms",
            MessageDispatched: false,
            Status: "Failed",
            AttemptCount: 2,
            LastErrorCode: "carrier_reject",
          },
        ],
      },
    ]);
  }) as typeof fetch;

  try {
    const campaigns = await adminApi.getCompanyCampaignsAll(7, {
      pageSize: 10,
      pageNumber: 1,
    });

    assert.equal(campaigns.length, 1);
    assert.equal(campaigns[0].recipients?.length, 2);
    assert.equal(campaigns[0].recipients?.[0].status, "Sent");
    assert.equal(campaigns[0].recipients?.[1].status, "Failed");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCompanyCampaignsAll fetches every page when Id filter is not used", async () => {
  const originalFetch = globalThis.fetch;
  const pageSize = 2;
  let callCount = 0;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    assert.match(url, /Backoffice\/companies\/7\/campaigns/);
    const u = new URL(url, "https://example.test");
    assert.equal(u.searchParams.get("PageSize"), String(pageSize));
    callCount += 1;
    const page = u.searchParams.get("PageNumber");
    if (page === "1") {
      return createJsonResponse([
        {
          Id: 1,
          Name: "A",
          CampaignMessage: "m",
          CampaignPurpose: "SmsAdvert",
          CampaignChannel: "Sms",
          CompanyId: 7,
          CreatorId: 9,
          StartDate: "2026-03-20T10:00:00Z",
          EndDate: "2026-03-21T10:00:00Z",
          Status: "Active",
          IsApproved: true,
        },
        {
          Id: 2,
          Name: "B",
          CampaignMessage: "m",
          CampaignPurpose: "SmsAdvert",
          CampaignChannel: "Sms",
          CompanyId: 7,
          CreatorId: 9,
          StartDate: "2026-03-20T10:00:00Z",
          EndDate: "2026-03-21T10:00:00Z",
          Status: "Active",
          IsApproved: true,
        },
      ]);
    }
    if (page === "2") {
      return createJsonResponse([
        {
          Id: 3,
          Name: "C",
          CampaignMessage: "m",
          CampaignPurpose: "SmsAdvert",
          CampaignChannel: "Sms",
          CompanyId: 7,
          CreatorId: 9,
          StartDate: "2026-03-20T10:00:00Z",
          EndDate: "2026-03-21T10:00:00Z",
          Status: "Completed",
          IsApproved: true,
        },
      ]);
    }
    return createJsonResponse([]);
  }) as typeof fetch;

  try {
    const campaigns = await adminApi.getCompanyCampaignsAll(7, { pageSize });
    assert.equal(callCount, 2);
    assert.equal(campaigns.length, 3);
    assert.deepEqual(
      campaigns.map((c) => c.id).sort((a, b) => a - b),
      [1, 2, 3],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getCompanyRecurringSchedules maps PascalCase schedule", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    assert.match(url, /Backoffice\/companies\/7\/campaigns\/recurring$/);
    return createJsonResponse([
      {
        Id: 6,
        CompanyId: 7,
        CreatorId: 2,
        Name: "BalloAds",
        CampaignMessage: "Dear @name",
        CampaignPurpose: "PersonalizedMessage",
        CampaignChannel: "Sms",
        Frequency: "Daily",
        Interval: 3,
        SendTime: "09:45:00",
        OccurrenceDurationMinutes: 60,
        StartsOn: "2026-04-16T07:33:55Z",
        EndsOn: "2026-04-17T22:00:00Z",
        Status: "Cancelled",
        OccurrencesGenerated: 0,
        RecentOccurrenceIds: [],
        CreatedAt: "2026-04-16T07:33:55Z",
      },
    ]);
  }) as typeof fetch;

  try {
    const rows = await adminApi.getCompanyRecurringSchedules(7);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, 6);
    assert.equal(rows[0].name, "BalloAds");
    assert.equal(rows[0].interval, 3);
    assert.equal(rows[0].sendTime, "09:45:00");
    assert.equal(rows[0].status, "Cancelled");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
