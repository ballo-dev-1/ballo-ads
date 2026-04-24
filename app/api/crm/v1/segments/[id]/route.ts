import { crmError, crmMessage } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["admin"], async () => {
    const { id } = await params;
    const data = await readCrmData();
    const segment = data.segments.find((item) => item.id === id);
    if (!segment) return crmError("Not found", 404, "Segment not found");
    segment.archivedAt = new Date().toISOString();
    await writeCrmData(data);
    return crmMessage("Segment archived");
  });
}
