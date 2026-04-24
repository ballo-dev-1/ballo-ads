import { cookies } from "next/headers";
import { crmMessage } from "@/lib/crmApi";
import { CRM_SESSION_COOKIE } from "@/lib/crmAuth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CRM_SESSION_COOKIE);
  return crmMessage("Logged out");
}
