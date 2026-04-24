import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const client = data.clients.find((item) => item.id === id);
    if (!client) return crmError("Not found", 404, "Client not found");
    const notes = data.clientAttributes.filter((item) => item.clientId === id);
    return crmOk({ ...client, attributes: notes });
  });
}
