import { crmError, crmMessage } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["editor", "admin"], async () => {
    const { id } = await params;
    const data = await readCrmData();
    const client = data.clients.find((item) => item.id === id);
    if (!client) return crmError("Not found", 404, "Client not found");
    client.accountStatus = "at_risk";
    client.healthScore = Math.min(client.healthScore, 35);
    await writeCrmData(data);
    return crmMessage("Client flagged as at-risk");
  });
}
