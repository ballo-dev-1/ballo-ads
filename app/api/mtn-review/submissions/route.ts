import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";
import { requireMtnReviewSession } from "@/lib/mtnReviewAuth";
import {
  isMtnReviewBackendConfigured,
  mtnReviewBackendRequest,
} from "@/lib/mtnReviewBackendServer";
import {
  mtnAppendSubmission,
  mtnListSubmissions,
} from "@/lib/mtnReviewSubmissionsStore";

function canIngest(request: NextRequest): boolean {
  const secret = process.env.MTN_REVIEW_DEMO_INGEST_SECRET?.trim();
  if (secret) {
    const h = request.headers.get("x-mtn-review-ingest-secret");
    return h === secret;
  }
  return process.env.NODE_ENV !== "production";
}

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;

  if (isMtnReviewBackendConfigured(host)) {
    try {
      const res = await mtnReviewBackendRequest(
        "/submissions",
        { method: "GET" },
        { host },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(
          { error: "Backend error", detail: data },
          { status: res.status },
        );
      }
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }

  return NextResponse.json({ submissions: mtnListSubmissions() });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const adminOk = Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);
  if (!adminOk && !canIngest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.companyId !== "number") {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  if (isMtnReviewBackendConfigured(host)) {
    try {
      const payload = {
        companyId: body.companyId,
        companyName:
          typeof body.companyName === "string" ? body.companyName : undefined,
        senderId: typeof body.senderId === "string" ? body.senderId : undefined,
        networks: Array.isArray(body.networks)
          ? body.networks.map(String)
          : [],
        registrationDocumentUrl:
          typeof body.registrationDocumentUrl === "string"
            ? body.registrationDocumentUrl
            : undefined,
        signatureImageUrl:
          typeof body.signatureImageUrl === "string"
            ? body.signatureImageUrl
            : undefined,
        profileImageUrl:
          typeof body.profileImageUrl === "string"
            ? body.profileImageUrl
            : undefined,
        email: typeof body.email === "string" ? body.email : undefined,
        phoneNumber:
          typeof body.phoneNumber === "string" ? body.phoneNumber : undefined,
        physicalAddress:
          typeof body.physicalAddress === "string"
            ? body.physicalAddress
            : undefined,
        industry: typeof body.industry === "string" ? body.industry : undefined,
        description:
          typeof body.description === "string" ? body.description : undefined,
        websiteUrl:
          typeof body.websiteUrl === "string" ? body.websiteUrl : undefined,
      };

      const res = await mtnReviewBackendRequest(
        "/submissions",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        { host },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(
          { error: "Backend rejected request", detail: data },
          { status: res.status },
        );
      }
      return NextResponse.json(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Backend unreachable";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const networks = Array.isArray(body.networks)
    ? body.networks.map(String)
    : [];
  const row = mtnAppendSubmission({
    companyId: body.companyId,
    companyName:
      typeof body.companyName === "string" ? body.companyName : undefined,
    senderId: typeof body.senderId === "string" ? body.senderId : undefined,
    networks,
    registrationDocumentUrl:
      typeof body.registrationDocumentUrl === "string"
        ? body.registrationDocumentUrl
        : undefined,
    signatureImageUrl:
      typeof body.signatureImageUrl === "string"
        ? body.signatureImageUrl
        : undefined,
    profileImageUrl:
      typeof body.profileImageUrl === "string" ? body.profileImageUrl : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    phoneNumber:
      typeof body.phoneNumber === "string" ? body.phoneNumber : undefined,
    physicalAddress:
      typeof body.physicalAddress === "string" ? body.physicalAddress : undefined,
    industry: typeof body.industry === "string" ? body.industry : undefined,
    description:
      typeof body.description === "string" ? body.description : undefined,
    websiteUrl:
      typeof body.websiteUrl === "string" ? body.websiteUrl : undefined,
  });
  return NextResponse.json({ submission: row });
}
