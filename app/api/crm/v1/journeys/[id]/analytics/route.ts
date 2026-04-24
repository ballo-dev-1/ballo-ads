import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const journey = data.journeys.find((item) => item.id === id);
    if (!journey) return crmError("Not found", 404, "Journey not found");
    return crmOk({
      journeyId: id,
      totalEnrolments: 0,
      completed: 0,
      conversionRate: 0,
      funnel: [],
    });
  });
}
