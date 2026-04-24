import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    const total = data.clients.length;
    const churned = data.clients.filter((item) => item.accountStatus === "churned").length;
    const churnRate = total ? Number(((churned / total) * 100).toFixed(1)) : 0;
    return crmOk({
      churnRate,
      retentionScore: Math.max(0, 100 - churnRate * 5),
      avgOpenRate: 0,
      totalClients: total,
      churnedThisMonth: churned,
    });
  });
}
