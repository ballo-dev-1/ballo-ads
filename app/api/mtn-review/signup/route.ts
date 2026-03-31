import { NextRequest, NextResponse } from "next/server";
import { mtnReviewBackendRequest } from "@/lib/mtnReviewBackendServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 },
        );
    }

    const backend = await mtnReviewBackendRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      const error = typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : backend.status === 404
          ? "Signup endpoint unavailable. Start/Deploy the backend with MTN auth routes."
          : "Signup failed.";
      return NextResponse.json({ error }, { status: backend.status });
    }

    return NextResponse.json({
      ok: true,
      message: "Account created. Awaiting backoffice approval.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
