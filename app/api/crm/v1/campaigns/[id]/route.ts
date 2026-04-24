import { crmError, crmMessage, crmOk } from "@/lib/crmApi";
import { withCrmAuth, withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmAuth(async () => {
    const { id } = await params;
    const data = await readCrmData();
    const campaign = data.campaigns.find((item) => item.id === id);
    if (!campaign) return crmError("Not found", 404, "Campaign not found");
    return crmOk(campaign);
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCrmRole(["admin"], async () => {
    const { id } = await params;
    const data = await readCrmData();
    const campaign = data.campaigns.find((item) => item.id === id);
    if (!campaign) return crmError("Not found", 404, "Campaign not found");
    if (campaign.status !== "scheduled") return crmError("Bad request", 400, "Only scheduled campaigns can be cancelled");
    campaign.status = "paused";
    await writeCrmData(data);
    return crmMessage("Campaign cancelled");
  });
}
