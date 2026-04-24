import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const logs = data.messageLogs.filter((item) => item.campaignId === id);
    const sent = logs.filter((item) => item.sentAt).length;
    const delivered = logs.filter((item) => ["delivered", "opened", "clicked"].includes(item.status)).length;
    const opened = logs.filter((item) => item.openedAt).length;
    const clicked = logs.filter((item) => item.clickedAt).length;
    return crmOk({
      sent,
      delivered,
      opened,
      clicked,
      openRate: delivered ? Number(((opened / delivered) * 100).toFixed(1)) : 0,
      ctr: delivered ? Number(((clicked / delivered) * 100).toFixed(1)) : 0,
    });
  });
}
