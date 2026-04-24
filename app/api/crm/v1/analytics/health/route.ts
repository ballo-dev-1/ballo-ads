import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    const clients = data.clients.filter((item) => item.accountStatus !== "churned");
    const healthyCount = clients.filter((item) => item.healthScore >= 70).length;
    const atRiskCount = clients.filter((item) => item.healthScore >= 40 && item.healthScore < 70).length;
    const criticalCount = clients.filter((item) => item.healthScore < 40).length;
    const avgScore = clients.length ? Math.round(clients.reduce((sum, item) => sum + item.healthScore, 0) / clients.length) : 0;
    return crmOk({ healthyCount, atRiskCount, criticalCount, avgScore, total: clients.length });
  });
}
