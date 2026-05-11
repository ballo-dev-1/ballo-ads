import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const segment = await prisma.crmSegment.findUnique({
      where: { id }
    });

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    return NextResponse.json({ data: segment });
  } catch (error) {
    console.error("Failed to get segment:", error);
    return NextResponse.json({ error: "Failed to get segment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    await prisma.crmSegment.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Segment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete segment:", error);
    return NextResponse.json({ error: "Failed to delete segment" }, { status: 500 });
  }
}
