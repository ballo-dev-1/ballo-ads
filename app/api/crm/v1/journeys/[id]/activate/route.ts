import { crmError, crmMessage } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["editor", "admin"], async () => {
    const { id } = await params;
    const data = await readCrmData();
    const journey = data.journeys.find((item) => item.id === id);
    if (!journey) return crmError("Not found", 404, "Journey not found");
    if (!journey.flowDefinition.nodes.length) return crmError("Bad request", 400, "Journey has no nodes");
    journey.status = "active";
    journey.activatedAt = new Date().toISOString();
    await writeCrmData(data);
    return crmMessage("Journey activated");
  });
}
