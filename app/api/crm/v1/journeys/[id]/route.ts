import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmRole, withCrmAuth } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const journey = data.journeys.find((item) => item.id === id);
    if (!journey) return crmError("Not found", 404, "Journey not found");
    return crmOk(journey);
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["editor", "admin"], async () => {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data = await readCrmData();
    const journey = data.journeys.find((item) => item.id === id);
    if (!journey) return crmError("Not found", 404, "Journey not found");
    if (journey.status === "active") return crmError("Bad request", 400, "Cannot edit active journey");
    Object.assign(journey, body);
    await writeCrmData(data);
    return crmOk(journey);
  });
}
