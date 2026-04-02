import { NextRequest, NextResponse } from "next/server";
import { getMtnReviewSessionUser, requireMtnReviewSession } from "@/lib/mtnReviewAuth";
import {
  isMtnReviewBackendConfigured,
  mtnReviewBackendRequest,
} from "@/lib/mtnReviewBackendServer";
import {
  mtnGetSubmission,
  mtnUpdateSubmissionStatus,
  type MtnSubmissionStatus,
} from "@/lib/mtnReviewSubmissionsStore";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;

  if (isMtnReviewBackendConfigured(host)) {
    try {
      const res = await mtnReviewBackendRequest(
        `/submissions/${encodeURIComponent(id)}`,
        { method: "GET" },
        { host },
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (!res.ok) {
        return NextResponse.json({ error: "Backend error", detail: data }, { status: res.status });
      }
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }

  const row = mtnGetSubmission(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ submission: row });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reviewer = await getMtnReviewSessionUser();
  let body: {
    status?: string;
    message?: string;
    files?: string[];
    reviewerId?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validStatuses = new Set(["accepted", "withdrawn", "pending", "request_changes"]);
  if (!body.status || !validStatuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const isRequestChanges = body.status === "request_changes";
  const hasMessage = typeof body.message === "string" && body.message.trim().length > 0;
  const hasFiles = Array.isArray(body.files) && body.files.length > 0;
  if (isRequestChanges && !hasMessage && !hasFiles) {
    return NextResponse.json(
      { error: "Provide a message or at least one file for request changes." },
      { status: 400 },
    );
  }

  if (isMtnReviewBackendConfigured(host)) {
    try {
      const res = await mtnReviewBackendRequest(
        `/submissions/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: body.status,
            message: typeof body.message === "string" ? body.message : undefined,
            files: Array.isArray(body.files) ? body.files : undefined,
            reviewerId:
              typeof body.reviewerId === "number" ? body.reviewerId : reviewer?.id,
          }),
        },
        { host },
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (!res.ok) {
        return NextResponse.json({ error: "Backend error", detail: data }, { status: res.status });
      }
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }

  const row = mtnUpdateSubmissionStatus(id, body.status as MtnSubmissionStatus, {
    message: typeof body.message === "string" ? body.message : undefined,
    files: Array.isArray(body.files) ? body.files : undefined,
    reviewerId:
      typeof body.reviewerId === "number"
        ? body.reviewerId
        : reviewer?.id,
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ submission: row });
}
