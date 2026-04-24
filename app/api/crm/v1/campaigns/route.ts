import { randomUUID } from "node:crypto";
import { z } from "zod";
import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth, withCrmRole } from "@/lib/crmServer";
import { evaluateRules, pushMessageLogsForCampaign, readCrmData, writeCrmData } from "@/lib/crmStore";

export async function GET(request: Request) {
  return withCrmAuth(async () => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const channel = url.searchParams.get("channel");
    const data = await readCrmData();
    let campaigns = data.campaigns.slice();
    if (status) campaigns = campaigns.filter((item) => item.status === status);
    if (channel) campaigns = campaigns.filter((item) => item.channel === channel);
    campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return crmOk(campaigns);
  });
}

export async function POST(request: Request) {
  return withCrmRole(["editor", "admin"], async () => {
    const parsed = z
      .object({
        name: z.string().min(1),
        channel: z.enum(["sms", "email", "whatsapp", "popup", "inbox"]),
        segmentId: z.string().optional(),
        content: z.record(z.unknown()).default({}),
        scheduledAt: z.string().datetime().nullable().optional(),
        userLimit: z.number().int().positive().default(100000),
        execSpeed: z.number().int().positive().default(500),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const campaign = {
      id: randomUUID(),
      name: parsed.data.name,
      journeyId: null,
      segmentId: parsed.data.segmentId ?? null,
      channel: parsed.data.channel,
      status: parsed.data.scheduledAt ? "scheduled" : "active",
      content: parsed.data.content,
      scheduledAt: parsed.data.scheduledAt ?? null,
      sentAt: parsed.data.scheduledAt ? null : new Date().toISOString(),
      userLimit: parsed.data.userLimit,
      execSpeed: parsed.data.execSpeed,
      createdAt: new Date().toISOString(),
    } as const;
    data.campaigns.unshift(campaign);
    if (!campaign.scheduledAt) {
      const recipients = campaign.segmentId
        ? evaluateRules(data.clients, data.segments.find((item) => item.id === campaign.segmentId)?.rules ?? [])
        : data.clients;
      pushMessageLogsForCampaign(
        data,
        campaign,
        recipients.slice(0, campaign.userLimit).map((item) => item.id),
      );
    }
    await writeCrmData(data);
    return crmOk(campaign, 201);
  });
}
