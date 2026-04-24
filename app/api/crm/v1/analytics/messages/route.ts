import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    const byMonth: Record<string, Record<string, number>> = {};
    for (const log of data.messageLogs) {
      if (!log.sentAt) continue;
      const d = new Date(log.sentAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { sms: 0, email: 0, whatsapp: 0, popup: 0, inbox: 0, total: 0 };
      byMonth[key][log.channel] += 1;
      byMonth[key].total += 1;
    }
    return crmOk(Object.entries(byMonth).map(([month, counts]) => ({ month, ...counts })));
  });
}
