import test from "node:test";
import assert from "node:assert/strict";
import { isNotificationVisibleToRoles } from "@/lib/notifications/roles";

test("isNotificationVisibleToRoles handles empty targets as public", () => {
  assert.equal(isNotificationVisibleToRoles([], ["superadmin"]), true);
});

test("isNotificationVisibleToRoles matches role casing and separators", () => {
  assert.equal(isNotificationVisibleToRoles(["super_admin"], ["SuperAdmin"]), true);
  assert.equal(isNotificationVisibleToRoles(["operations"], ["admin"]), false);
});
