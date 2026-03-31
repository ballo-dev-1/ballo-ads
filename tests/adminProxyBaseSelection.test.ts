import test from "node:test";
import assert from "node:assert/strict";
import { DEV_API_BASE, PROD_API_BASE } from "@/lib/adminApi";
import { resolveProxyBaseUrl } from "@/lib/adminProxyBase";

test("resolveProxyBaseUrl rewrites localhost base to deployed base by env cookie", () => {
  const result = resolveProxyBaseUrl({
    baseFromHeader: "http://localhost:5238",
    baseFromEnvCookie: DEV_API_BASE,
    allowLocalBackendProxy: false,
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("expected ok result");
  assert.equal(result.baseUrl, DEV_API_BASE.replace(/\/+$/, ""));
});

test("resolveProxyBaseUrl keeps localhost base when explicitly allowed", () => {
  const result = resolveProxyBaseUrl({
    baseFromHeader: "http://localhost:5238",
    baseFromEnvCookie: DEV_API_BASE,
    allowLocalBackendProxy: true,
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("expected ok result");
  assert.equal(result.baseUrl, "http://localhost:5238");
});

test("resolveProxyBaseUrl falls back to production when localhost is disallowed and no cookie base", () => {
  const result = resolveProxyBaseUrl({
    baseFromHeader: "http://127.0.0.1:5238/",
    baseFromEnvCookie: null,
    allowLocalBackendProxy: false,
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("expected ok result");
  assert.equal(result.baseUrl, PROD_API_BASE.replace(/\/+$/, ""));
});

test("resolveProxyBaseUrl rejects unknown base URLs", () => {
  const result = resolveProxyBaseUrl({
    baseFromHeader: "https://evil.example.com",
    baseFromEnvCookie: null,
    allowLocalBackendProxy: false,
  });

  assert.equal(result.ok, false);
});
