import test from "node:test";
import assert from "node:assert/strict";
import { getAdminEnv } from "@/lib/adminNamespace";

test("getAdminEnv resolves /admin on dev domain to dev env", () => {
  const env = getAdminEnv({
    pathname: "/admin/dashboard",
    host: "dev.balloads.com",
  });
  assert.equal(env, "dev");
});

test("getAdminEnv resolves /admin on staging domain to staging env", () => {
  const env = getAdminEnv({
    pathname: "/admin/dashboard",
    host: "staging.balloads.com",
  });
  assert.equal(env, "staging");
});

test("getAdminEnv resolves /admin on production domain to prod env", () => {
  const env = getAdminEnv({
    pathname: "/admin/dashboard",
    host: "balloads.com",
  });
  assert.equal(env, "prod");
});

test("getAdminEnv keeps namespace fallback for local hosts", () => {
  const env = getAdminEnv({
    pathname: "/dev-admin/dashboard",
    host: "localhost:3000",
  });
  assert.equal(env, "dev");
});
