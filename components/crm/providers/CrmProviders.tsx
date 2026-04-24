"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCrmNavigator } from "@/lib/crmStores";

const SCREEN_PATH: Record<string, string> = {
  dashboard: "/crm",
  clients: "/crm/clients",
  segments: "/crm/segments",
  journeys: "/crm/journeys",
  campaigns: "/crm/campaigns",
  analytics: "/crm/analytics",
};

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
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#111C47",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12.5px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
