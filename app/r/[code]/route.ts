import { NextRequest, NextResponse } from "next/server";
import { readCrmData, registerLinkClick, writeCrmData } from "@/lib/crmStore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await readCrmData();
  const link = data.trackedLinks.find((item) => item.shortCode === code);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  registerLinkClick(data, link, request.headers.get("user-agent"), request.ip ?? null);
  await writeCrmData(data);
  return NextResponse.redirect(link.originalUrl, 302);
}
