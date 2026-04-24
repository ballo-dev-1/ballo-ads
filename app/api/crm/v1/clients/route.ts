import { NextRequest } from "next/server";
import { z } from "zod";
import { crmOk } from "@/lib/crmApi";
import { withCrmAuth, withCrmRole } from "@/lib/crmServer";
import { readCrmData } from "@/lib/crmStore";

export async function GET(request: NextRequest) {
  return withCrmAuth(async () => {
    const params = request.nextUrl.searchParams;
    const search = (params.get("search") || "").toLowerCase();
    const industry = params.get("industry");
    const status = params.get("status");
    const plan = params.get("plan");
    const page = Number(params.get("page") || "1");
    const limit = Number(params.get("limit") || "50");
    const data = await readCrmData();
    let clients = data.clients.slice();
    if (industry) clients = clients.filter((item) => item.industry === industry);
    if (status) clients = clients.filter((item) => item.accountStatus === status);
    if (plan) clients = clients.filter((item) => item.planTier === plan);
    if (search) clients = clients.filter((item) => item.companyName.toLowerCase().includes(search));
    clients.sort((a, b) => a.healthScore - b.healthScore);
    const start = (page - 1) * limit;
    const paged = clients.slice(start, start + limit);
    return crmOk({ data: paged, total: clients.length, page, limit, hasMore: start + paged.length < clients.length });
  });
}

export async function POST(request: NextRequest) {
  return withCrmRole(["admin"], async () => {
    const payload = await request.json().catch(() => ({}));
    const schema = z.object({ trigger: z.literal("sync-all") });
    schema.parse(payload);
    return crmOk({ queued: true, message: "Data sync triggered." }, 202);
  });
}
