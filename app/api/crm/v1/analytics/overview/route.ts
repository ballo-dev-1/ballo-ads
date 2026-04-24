import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    return crmOk({
      totalClients: data.clients.length,
      activeJourneys: data.journeys.filter((item) => item.status === "active").length,
      messagesSentMtd: data.messageLogs.filter((item) => item.sentAt).length,
      atRiskCount: data.clients.filter((item) => item.healthScore < 40 || item.accountStatus === "at_risk").length,
    });
  });
}
