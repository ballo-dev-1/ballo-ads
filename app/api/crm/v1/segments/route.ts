import { randomUUID } from "node:crypto";
import { z } from "zod";
import { crmError, crmMessage, crmOk } from "@/lib/crmApi";
import { withCrmAuth, withCrmRole } from "@/lib/crmServer";
import { evaluateRules, readCrmData, writeCrmData } from "@/lib/crmStore";

const ruleSchema = z.object({ attr: z.string(), op: z.string(), val: z.string() });

export async function GET() {
  return withCrmAuth(async () => {
    const data = await readCrmData();
    return crmOk(data.segments.filter((item) => !item.archivedAt));
  });
}

export async function POST(request: Request) {
  return withCrmRole(["editor", "admin"], async () => {
    const parsed = z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
        rules: z.array(ruleSchema).default([]),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const matched = evaluateRules(data.clients, parsed.data.rules);
    const segment = {
      id: randomUUID(),
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.rules.length ? "dynamic" : "static",
      rules: parsed.data.rules,
      clientCount: matched.length,
      lastEvaluatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      archivedAt: null,
    } as const;
    data.segments.unshift(segment);
    await writeCrmData(data);
    return crmMessage(`Segment created with ${matched.length} clients`, 201, { data: segment });
  });
}
