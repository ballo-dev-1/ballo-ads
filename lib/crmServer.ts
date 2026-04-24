import { randomUUID } from "node:crypto";
import { crmError } from "@/lib/crmApi";
import { requireCrmAuth, requireCrmRole } from "@/lib/crmAuth";
import { appendAuditLog, readCrmData, writeCrmData } from "@/lib/crmStore";
import type { InternalUserRole } from "@/lib/crmTypes";

export async function withCrmAuth<T>(handler: (ctx: { user: Awaited<ReturnType<typeof requireCrmAuth>> extends { user: infer U } ? U : never }) => Promise<Response>) {
  const auth = await requireCrmAuth();
  if ("response" in auth) return auth.response;
  return handler({ user: auth.user });
}

export async function withCrmRole(required: InternalUserRole[], handler: (ctx: { user: Awaited<ReturnType<typeof requireCrmAuth>> extends { user: infer U } ? U : never }) => Promise<Response>) {
  const auth = await requireCrmAuth();
  if ("response" in auth) return auth.response;
  if (!requireCrmRole(auth.user, required)) return crmError("Forbidden", 403);
  return handler({ user: auth.user });
}

export async function withCrmMutation(
  user: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>,
  mutate: (data: Awaited<ReturnType<typeof readCrmData>>) => void,
) {
  const data = await readCrmData();
  mutate(data);
  appendAuditLog(data, { ...user, name: user.email, role: "viewer", isInternal: true }, action, entityType, entityId ?? randomUUID(), payload);
  await writeCrmData(data);
}
