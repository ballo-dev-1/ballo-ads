"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCrmNavigator } from "@/lib/crmStores";
import { useCrmTheme } from "@/app/crm/contexts/CrmThemeContext";

const SCREEN_PATH: Record<string, string> = {
  dashboard: "/crm",
  clients: "/crm/clients",
  segments: "/crm/segments",
  journeys: "/crm/journeys",
  campaigns: "/crm/campaigns",
  analytics: "/crm/analytics",
};

function CrmToaster() {
  const { isDark } = useCrmTheme();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: isDark
          ? {
              background: "#111C47",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "12.5px",
            }
          : {
              background: "#ffffff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              fontSize: "12.5px",
            },
      }}
    />
  );
}

export default function CrmProviders({ children }: PropsWithChildren) {
  const router = useRouter();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    setCrmNavigator((screen) => {
      const path = SCREEN_PATH[screen] || "/crm";
      router.push(path);
    });
  }, [router]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <CrmToaster />
    </QueryClientProvider>
  );
}
