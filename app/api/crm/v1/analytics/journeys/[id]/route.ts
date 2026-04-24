import { crmOk } from "@/lib/crmApi";
import { withCrmAuth } from "@/lib/crmServer";

export async function GET() {
  return withCrmAuth(async () => crmOk([]));
}
