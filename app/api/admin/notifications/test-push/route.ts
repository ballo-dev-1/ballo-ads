import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { sendPushToTopic } from "@/lib/firebase/admin";
import { DEFAULT_BACKOFFICE_TOPIC } from "@/lib/firebase/topic";

type TestPushBody = {
  title?: string;
  body?: string;
  link?: string;
  topic?: string;
};

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const payload = (await request.json().catch(() => ({}))) as TestPushBody;
  const title = payload.title?.trim() || "Backoffice test notification";
  const body = payload.body?.trim() || "Firebase push is configured and working.";
  const link = payload.link?.trim() || "/admin/dashboard";
  const topic = payload.topic?.trim() || DEFAULT_BACKOFFICE_TOPIC;

  try {
    const result = await sendPushToTopic({ title, body, link }, topic);
    if (!result.configured) {
      return NextResponse.json(
        { sent: false, configured: false, message: "Firebase Admin is not configured" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      sent: true,
      configured: true,
      topic: result.topic,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Failed to send test push", error);
    return NextResponse.json(
      { sent: false, error: "Failed to send test push notification" },
      { status: 500 },
    );
  }
}
