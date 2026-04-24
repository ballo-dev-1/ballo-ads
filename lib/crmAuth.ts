import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { InternalUser, InternalUserRole } from "@/lib/crmTypes";

export const CRM_SESSION_COOKIE = "crm-session";
const JWT_ALG = "HS256";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

type CrmJwt = InternalUser & { exp: number; iat: number };

function secretKey() {
  const secret = process.env.CRM_SESSION_SECRET || process.env.JWT_SECRET || "dev-crm-secret";
  return new TextEncoder().encode(secret);
}

function safeRole(value: unknown): InternalUserRole {
  if (value === "admin" || value === "editor" || value === "viewer") return value;
  return "viewer";
}

export async function issueCrmSession(user: InternalUser) {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isInternal: true,
  })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${SEVEN_DAYS_SECONDS}s`)
    .sign(secretKey());
}

export async function parseCrmSession(token: string): Promise<InternalUser | null> {
  try {
    const verified = await jwtVerify(token, secretKey(), { algorithms: [JWT_ALG] });
    const payload = verified.payload as unknown as CrmJwt;
    if (!payload?.isInternal) return null;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: safeRole(payload.role),
      isInternal: true,
    };
  } catch {
    return null;
  }
}

export async function getCrmUserFromCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CRM_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return parseCrmSession(raw);
}

export async function requireCrmAuth(): Promise<{ user: InternalUser } | { response: Response }> {
  const user = await getCrmUserFromCookie();
  if (!user) {
    return {
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { user };
}

export function requireCrmRole(user: InternalUser, roles: InternalUserRole[]) {
  return roles.includes(user.role);
}
