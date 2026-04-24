import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { evaluateRules, readCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const segment = data.segments.find((item) => item.id === id && !item.archivedAt);
    if (!segment) return crmError("Not found", 404, "Segment not found");
    const clients = evaluateRules(data.clients, segment.rules);
    return crmOk({ data: clients, count: clients.length });
  });
}
