import { z } from "zod";
import { crmError, crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";
import { evaluateRules, readCrmData } from "@/lib/crmStore";

export async function POST(request: Request) {
  return withCrmAuth(async () => {
    const parsed = z
      .object({ rules: z.array(z.object({ attr: z.string(), op: z.string(), val: z.string() })) })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return crmError("Validation error", 400);
    const data = await readCrmData();
    const matched = evaluateRules(data.clients, parsed.data.rules);
    return crmOk({ count: matched.length, clientIds: matched.slice(0, 5).map((item) => item.id) });
  });
}
