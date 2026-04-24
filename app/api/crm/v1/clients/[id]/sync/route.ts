import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const client = data.clients.find((item) => item.id === id);
    if (!client) return crmError("Not found", 404, "Client not found");
    client.syncedAt = new Date().toISOString();
    client.healthScore = Math.max(0, Math.min(100, client.healthScore + 2));
    await writeCrmData(data);
    return crmOk(client);
  });
}
