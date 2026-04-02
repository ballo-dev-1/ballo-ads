import test from "node:test";
import assert from "node:assert/strict";
import { mtnReviewBackendConfigForHost } from "@/lib/mtnReviewBackendServer";

function withEnv<T extends Record<string, string | undefined>, R>(
  env: T,
  fn: () => R,
): R {
  const prev: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prev[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("dev.balloads.com maps to dev base + dev secret", () => {
  withEnv(
    {
      NODE_ENV: "production",
      NEXT_PUBLIC_DEV_API_URL: "https://dev-api.local",
      NEXT_PUBLIC_STAGING_API_URL: "https://staging-api.local",
      NEXT_PUBLIC_PROD_API_URL: "https://api.local",
      MTN_REVIEW_BACKEND_SECRET_DEV: "dev-secret",
      MTN_REVIEW_BACKEND_SECRET_STAGING: "staging-secret",
      MTN_REVIEW_BACKEND_SECRET_PROD: "prod-secret",
      MTN_REVIEW_BACKEND_SECRET: undefined,
    },
    () => {
      const cfg = mtnReviewBackendConfigForHost("dev.balloads.com");
      assert.equal(cfg.env, "dev");
      assert.equal(cfg.base, "https://dev-api.local");
      assert.equal(cfg.secret, "dev-secret");
      assert.equal(cfg.usedImplicitDevDefaults, false);
    },
  );
});

test("staging.balloads.com maps to staging base + staging secret", () => {
  withEnv(
    {
      NODE_ENV: "production",
      NEXT_PUBLIC_DEV_API_URL: "https://dev-api.local",
      NEXT_PUBLIC_STAGING_API_URL: "https://staging-api.local",
      NEXT_PUBLIC_PROD_API_URL: "https://api.local",
      MTN_REVIEW_BACKEND_SECRET_DEV: "dev-secret",
      MTN_REVIEW_BACKEND_SECRET_STAGING: "staging-secret",
      MTN_REVIEW_BACKEND_SECRET_PROD: "prod-secret",
      MTN_REVIEW_BACKEND_SECRET: undefined,
    },
    () => {
      const cfg = mtnReviewBackendConfigForHost("staging.balloads.com");
      assert.equal(cfg.env, "staging");
      assert.equal(cfg.base, "https://staging-api.local");
      assert.equal(cfg.secret, "staging-secret");
      assert.equal(cfg.usedImplicitDevDefaults, false);
    },
  );
});

test("balloads.com maps to prod base + prod secret", () => {
  withEnv(
    {
      NODE_ENV: "production",
      NEXT_PUBLIC_DEV_API_URL: "https://dev-api.local",
      NEXT_PUBLIC_STAGING_API_URL: "https://staging-api.local",
      NEXT_PUBLIC_PROD_API_URL: "https://api.local",
      MTN_REVIEW_BACKEND_SECRET_DEV: "dev-secret",
      MTN_REVIEW_BACKEND_SECRET_STAGING: "staging-secret",
      MTN_REVIEW_BACKEND_SECRET_PROD: "prod-secret",
      MTN_REVIEW_BACKEND_SECRET: undefined,
    },
    () => {
      const cfg = mtnReviewBackendConfigForHost("balloads.com");
      assert.equal(cfg.env, "prod");
      assert.equal(cfg.base, "https://api.local");
      assert.equal(cfg.secret, "prod-secret");
      assert.equal(cfg.usedImplicitDevDefaults, false);
    },
  );
});

test("falls back to generic MTN_REVIEW_BACKEND_SECRET when env-specific secret missing", () => {
  withEnv(
    {
      NODE_ENV: "production",
      NEXT_PUBLIC_DEV_API_URL: "https://dev-api.local",
      NEXT_PUBLIC_STAGING_API_URL: "https://staging-api.local",
      NEXT_PUBLIC_PROD_API_URL: "https://api.local",
      MTN_REVIEW_BACKEND_SECRET_DEV: undefined,
      MTN_REVIEW_BACKEND_SECRET_STAGING: undefined,
      MTN_REVIEW_BACKEND_SECRET_PROD: undefined,
      MTN_REVIEW_BACKEND_SECRET: "generic-secret",
    },
    () => {
      const cfg = mtnReviewBackendConfigForHost("dev.balloads.com");
      assert.equal(cfg.env, "dev");
      assert.equal(cfg.base, "https://dev-api.local");
      assert.equal(cfg.secret, "generic-secret");
    },
  );
});

test("unknown host/localhost keeps legacy NODE_ENV-based dev defaults", () => {
  withEnv(
    {
      NODE_ENV: "development",
      NEXT_PUBLIC_DEV_API_URL: "https://dev-api.local",
      NEXT_PUBLIC_STAGING_API_URL: "https://staging-api.local",
      NEXT_PUBLIC_PROD_API_URL: "https://api.local",
      BACKEND_BASE_URL: undefined,
      MTN_REVIEW_BACKEND_SECRET: undefined,
      MTN_REVIEW_BACKEND_SECRET_DEV: undefined,
      MTN_REVIEW_BACKEND_SECRET_STAGING: undefined,
      MTN_REVIEW_BACKEND_SECRET_PROD: undefined,
    },
    () => {
      const cfg = mtnReviewBackendConfigForHost("localhost:3000");
      assert.equal(cfg.env, "dev");
      assert.equal(cfg.base, "https://dev-api.local");
      assert.equal(cfg.secret, "local-dev-mtn-review-backend-secret");
      assert.equal(cfg.usedImplicitDevDefaults, true);
    },
  );
});

