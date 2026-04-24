import { randomUUID } from "node:crypto";
import { z } from "zod";
import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmRole } from "@/lib/crmServer";
import { createShortCode, readCrmData, writeCrmData } from "@/lib/crmStore";

export async function POST(request: Request) {
  return withCrmRole(["editor", "admin"], async () => {
    const parsed = z
      .object({
        originalUrl: z.string().url(),
        campaignId: z.string().optional(),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const shortCode = createShortCode();
    const link = {
      id: randomUUID(),
      originalUrl: parsed.data.originalUrl,
      shortCode,
      campaignId: parsed.data.campaignId ?? null,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    };
    data.trackedLinks.unshift(link);
    await writeCrmData(data);
    return crmOk({ ...link, shortUrl: `${process.env.CRM_SHORTLINK_BASE || "http://localhost:3000"}/r/${shortCode}` }, 201);
  });
}
