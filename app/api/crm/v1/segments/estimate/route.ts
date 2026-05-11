import { NextRequest, NextResponse } from "next/server";
import { SegmentService } from "@/lib/services/segmentService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rules } = body;

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json({ error: "Rules array is required" }, { status: 400 });
    }

    const estimation = await SegmentService.estimateReach(rules);

    return NextResponse.json({ data: estimation });
  } catch (error) {
    console.error("Failed to estimate segment reach:", error);
    return NextResponse.json({ error: "Failed to estimate reach" }, { status: 500 });
  }
}
