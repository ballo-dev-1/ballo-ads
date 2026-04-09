import test from "node:test";
import assert from "node:assert/strict";
import { mtnReviewBackendRequest } from "@/lib/mtnReviewBackendServer";

function withEnv<T extends Record<string, string | undefined>, R>(
  env: T,
  fn: () => Promise<R>,
): Promise<R> {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  return fn().finally(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
}

test("dev host retries signup against dev.balloads.com/api when dev-api returns 404", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (calls.length === 1) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ reviewer: { id: 1 } }), { status: 200 });
  }) as typeof fetch;

  try {
    const response = await withEnv(
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_DEV_API_URL: "https://dev-api.balloads.com",
        MTN_REVIEW_BACKEND_SECRET_DEV: "dev-secret",
        MTN_REVIEW_BACKEND_SECRET: undefined,
        MTN_REVIEW_BACKEND_SECRET_STAGING: undefined,
        MTN_REVIEW_BACKEND_SECRET_PROD: undefined,
      },
      () =>
        mtnReviewBackendRequest(
          "/auth/signup",
          { method: "POST", body: JSON.stringify({}) },
          { host: "dev.balloads.com" },
        ),
    );

    assert.equal(response.status, 200);
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0],
      "https://dev-api.balloads.com/internal/mtn-review/auth/signup",
    );
    assert.equal(
      calls[1],
      "https://dev.balloads.com/api/internal/mtn-review/auth/signup",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("dev host retries signup against dev-api when base points at dev site /api", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (calls.length === 1) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ reviewer: { id: 1 } }), { status: 200 });
  }) as typeof fetch;

  try {
    const response = await withEnv(
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_DEV_API_URL: "https://dev.balloads.com/api",
        MTN_REVIEW_BACKEND_SECRET_DEV: "dev-secret",
        MTN_REVIEW_BACKEND_SECRET: undefined,
        MTN_REVIEW_BACKEND_SECRET_STAGING: undefined,
        MTN_REVIEW_BACKEND_SECRET_PROD: undefined,
      },
      () =>
        mtnReviewBackendRequest(
          "/auth/signup",
          { method: "POST", body: JSON.stringify({}) },
          { host: "dev.balloads.com" },
        ),
    );

    assert.equal(response.status, 200);
    assert.equal(calls.length, 2);
    assert.equal(
      calls[0],
      "https://dev.balloads.com/api/internal/mtn-review/auth/signup",
    );
    assert.equal(
      calls[1],
      "https://dev-api.balloads.com/internal/mtn-review/auth/signup",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
