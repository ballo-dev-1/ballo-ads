import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { unsubscribeTokenFromTopic } from "@/lib/firebase/admin";

type UnsubscribeBody = {
  token?: string;
  topic?: string;
};

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as UnsubscribeBody;
  if (!body.token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const result = await unsubscribeTokenFromTopic(body.token, body.topic);
  if (!result.configured) {
    return NextResponse.json(
      { unsubscribed: false, configured: false, message: "Firebase Admin is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    unsubscribed: true,
    configured: true,
    topic: result.topic,
    successCount: result.response.successCount,
    failureCount: result.response.failureCount,
  });
}
