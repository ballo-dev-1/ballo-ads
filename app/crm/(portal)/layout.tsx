import { redirect } from "next/navigation";
import CrmShell from "@/components/crm/CrmShell";
import { getCrmUserFromCookie } from "@/lib/crmAuth";

export default async function CrmProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCrmUserFromCookie();
  if (!user) redirect("/crm/login?return=/crm");
  return <CrmShell>{children}</CrmShell>;
}
