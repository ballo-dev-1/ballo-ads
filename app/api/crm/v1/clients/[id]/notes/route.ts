import { z } from "zod";
import { crmError, crmMessage } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { readCrmData, upsertClientNote, writeCrmData } from "@/lib/crmStore";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["editor", "admin"], async () => {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({ text: z.string().min(1) }).safeParse(body);
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const client = data.clients.find((item) => item.id === id);
    if (!client) return crmError("Not found", 404, "Client not found");
    upsertClientNote(data, id, parsed.data.text);
    await writeCrmData(data);
    return crmMessage("Note saved");
  });
}
