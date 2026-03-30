import { NextRequest, NextResponse } from "next/server";
import { requireMtnReviewSession } from "@/lib/mtnReviewAuth";
import {
  isMtnReviewBackendConfigured,
  mtnReviewBackendRequest,
} from "@/lib/mtnReviewBackendServer";
import {
  mtnGetSubmission,
  mtnUpdateSubmissionStatus,
} from "@/lib/mtnReviewSubmissionsStore";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;

  if (isMtnReviewBackendConfigured()) {
    try {
      const res = await mtnReviewBackendRequest(`/submissions/${encodeURIComponent(id)}`, {
        method: "GET",
      });
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
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.status !== "accepted" && body.status !== "withdrawn") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (isMtnReviewBackendConfigured()) {
    try {
      const res = await mtnReviewBackendRequest(`/submissions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: body.status }),
      });
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

  const row = mtnUpdateSubmissionStatus(id, body.status);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ submission: row });
}
