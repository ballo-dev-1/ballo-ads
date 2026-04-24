import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  return withCrmAuth(async () => {
    const { code } = await params;
    const data = await readCrmData();
    const link = data.trackedLinks.find((item) => item.shortCode === code);
    if (!link) return crmError("Not found", 404, "Link not found");
    const clicks = data.linkClicks.filter((item) => item.trackedLinkId === link.id);
    return crmOk({ ...link, clicks: clicks.length, uniqueClicks: clicks.length });
  });
}
