"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/crm/layout/AppShell";
import { clearCrmTokens, getCrmApiBase, getCrmToken, getCrmUser, setCrmUser } from "@/lib/crmApiClient";

export default function CrmProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(
    null,
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getCrmToken();
    const stored = getCrmUser();
    if (stored?.id) {
      setUser({
        id: stored.id,
        name: stored.name || "CRM User",
        email: stored.email || "",
        role: stored.role || "viewer",
      });
    }
    if (!token) {
      router.replace(`/crm/login?return=${encodeURIComponent(pathname || "/crm")}`);
      setChecking(false);
      return;
    }

    fetch(`${getCrmApiBase()}/api/crm/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.authenticated) {
          clearCrmTokens();
          router.replace(`/crm/login?return=${encodeURIComponent(pathname || "/crm")}`);
          return;
        }
        const nextUser = {
          id: String(json.user?.id || ""),
          name: String(json.user?.name || "CRM User"),
          email: String(json.user?.email || ""),
          role: String(json.user?.role || "viewer"),
        };
        setCrmUser(nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        clearCrmTokens();
        router.replace(`/crm/login?return=${encodeURIComponent(pathname || "/crm")}`);
      })
      .finally(() => setChecking(false));
  }, [router, pathname]);

  if (checking) {
    return <div className="h-screen bg-[#0B1437]" />;
  }

  return (
    <AppShell
      user={user}
    >
      {children}
    </AppShell>
  );
}
