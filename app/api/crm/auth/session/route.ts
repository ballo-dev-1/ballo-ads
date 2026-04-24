import { crmError, crmOk } from "@/lib/crmApi";
import { getCrmUserFromCookie } from "@/lib/crmAuth";

export async function GET() {
  const user = await getCrmUserFromCookie();
  if (!user) return crmError("Unauthorized", 401);
  return crmOk({ authenticated: true, user });
}
