import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SegmentService } from "@/lib/services/segmentService";

export async function GET() {
  try {
    const segments = await prisma.crmSegment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: segments });
  } catch (error) {
    console.error("Failed to list segments:", error);
    return NextResponse.json({ error: "Failed to list segments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, rules, type = "dynamic" } = body;

    if (!name || !rules) {
      return NextResponse.json({ error: "Name and rules are required" }, { status: 400 });
    }

    // Estimate reach before saving
    const { count } = await SegmentService.estimateReach(rules);

    const segment = await prisma.crmSegment.create({
      data: {
        name,
        description,
        type,
        rules: rules as any,
        clientCount: count,
        lastEvaluatedAt: new Date(),
      }
    });

    return NextResponse.json({ data: segment });
  } catch (error) {
    console.error("Failed to create segment:", error);
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 });
  }
}
