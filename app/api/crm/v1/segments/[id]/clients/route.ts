import { NextRequest, NextResponse } from "next/server";
import { SegmentService } from "@/lib/services/segmentService";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const clients = await SegmentService.getClientsForSegment(id);
    
    return NextResponse.json({ 
      data: clients,
      count: clients.length 
    });
  } catch (error) {
    console.error("Failed to get segment clients:", error);
    return NextResponse.json({ error: "Failed to get segment clients" }, { status: 500 });
  }
}
