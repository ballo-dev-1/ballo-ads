import { randomUUID } from "node:crypto";
import { z } from "zod";
import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth, withCrmRole } from "@/lib/crmServer";
import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    return crmOk(data.journeys);
  });
}

export async function POST(request: Request) {
  return withCrmRole(["editor", "admin"], async ({ user }) => {
    const parsed = z
      .object({
        name: z.string().min(1),
        triggerType: z.string().default("manual"),
        triggerConfig: z.record(z.unknown()).default({}),
        flowDefinition: z.object({ nodes: z.array(z.unknown()), edges: z.array(z.unknown()) }).default({ nodes: [], edges: [] }),
        entrySegmentId: z.string().optional(),
        maxDurationDays: z.number().int().min(1).default(7),
        entryMode: z.enum(["once_per_client", "once_during_open", "recurring"]).default("once_per_client"),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const journey = {
      id: randomUUID(),
      name: parsed.data.name,
      status: "draft",
      triggerType: parsed.data.triggerType,
      triggerConfig: parsed.data.triggerConfig,
      flowDefinition: parsed.data.flowDefinition,
      entrySegmentId: parsed.data.entrySegmentId ?? null,
      maxDurationDays: parsed.data.maxDurationDays,
      entryMode: parsed.data.entryMode,
      createdBy: user.id,
      activatedAt: null,
      createdAt: new Date().toISOString(),
    } as const;
    data.journeys.unshift(journey);
    await writeCrmData(data);
    return crmOk(journey, 201);
  });
}
