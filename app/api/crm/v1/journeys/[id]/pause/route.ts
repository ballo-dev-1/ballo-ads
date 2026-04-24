import { crmError, crmMessage } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["editor", "admin"], async () => {
    const { id } = await params;
    const data = await readCrmData();
    const journey = data.journeys.find((item) => item.id === id);
    if (!journey) return crmError("Not found", 404, "Journey not found");
    journey.status = "paused";
    await writeCrmData(data);
    return crmMessage("Journey paused");
  });
}
