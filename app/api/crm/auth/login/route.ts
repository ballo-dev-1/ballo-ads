import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { crmError, crmMessage } from "@/lib/crmApi";
import { CRM_SESSION_COOKIE, issueCrmSession } from "@/lib/crmAuth";
import { hashPassword, readCrmData } from "@/lib/crmStore";
import type { InternalUserRole } from "@/lib/crmTypes";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const inputEmail = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!inputEmail || !password) return crmError("Email and password are required", 400);

  // CRM runs on internal auth boundaries; integrate with org SSO via env endpoint when available.
  // Fallback keeps local development functional.
  let sessionEmail = inputEmail;
  let userId = randomUUID();
  let role: InternalUserRole = "viewer";
  let name = inputEmail.split("@")[0] || "CRM User";
  if (process.env.CRM_SSO_LOGIN_URL) {
    try {
      const response = await fetch(process.env.CRM_SSO_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail, password }),
      });
      if (!response.ok) return crmError("Invalid credentials", 401);
      const payload = (await response.json()) as Record<string, unknown>;
      role = payload.role === "admin" || payload.role === "editor" ? (payload.role as InternalUserRole) : "viewer";
      name = typeof payload.name === "string" && payload.name ? payload.name : name;
    } catch {
      return crmError("Unable to contact SSO provider", 502);
    }
  } else {
    const data = await readCrmData();
    const matchedUser = data.users.find((user) => user.email.toLowerCase() === inputEmail.toLowerCase());
    if (!matchedUser) return crmError("Invalid credentials", 401);
    if (matchedUser.passwordHash !== hashPassword(password)) return crmError("Invalid credentials", 401);
    sessionEmail = matchedUser.email;
    userId = matchedUser.id;
    role = matchedUser.role;
    name = matchedUser.name;
  }

  const token = await issueCrmSession({
    id: userId,
    name,
    email: sessionEmail,
    role,
    isInternal: true,
  });

  const cookieStore = await cookies();
  cookieStore.set(CRM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return crmMessage("Authenticated");
}
