import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { subscribeTokenToTopic } from "@/lib/firebase/admin";

type SubscribeBody = {
  token?: string;
  topic?: string;
};

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  if (!body.token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const result = await subscribeTokenToTopic(body.token, body.topic);
  if (!result.configured) {
    return NextResponse.json(
      { subscribed: false, configured: false, message: "Firebase Admin is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    subscribed: true,
    configured: true,
    topic: result.topic,
    successCount: result.response.successCount,
    failureCount: result.response.failureCount,
  });
}
