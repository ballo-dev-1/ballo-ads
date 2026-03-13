import type {
  DashboardAnalyticsOverviewResponse,
  DashboardAnalyticsTrendPoint,
} from "@/lib/adminApi";

export type DashboardKpiCard = {
  key: string;
  label: string;
  value: number;
  delta: number;
  unit?: "currency" | "percent" | "count";
};

export function buildDashboardKpiCards(
  current: DashboardAnalyticsOverviewResponse | null,
  previous: DashboardAnalyticsOverviewResponse | null,
): DashboardKpiCard[] {
  const currentSafe = current ?? {
    generatedAt: "",
    activeCampaigns: 0,
    totalCompanies: 0,
    activeClients: 0,
    totalRevenue: 0,
    paymentSuccessRate: 0,
  };
  const previousSafe = previous ?? {
    generatedAt: "",
    activeCampaigns: 0,
    totalCompanies: 0,
    activeClients: 0,
    totalRevenue: 0,
    paymentSuccessRate: 0,
  };

  return [
    {
      key: "active-campaigns",
      label: "Active Campaigns",
      value: currentSafe.activeCampaigns,
      delta: currentSafe.activeCampaigns - previousSafe.activeCampaigns,
      unit: "count",
    },
    {
      key: "total-companies",
      label: "Total Companies",
      value: currentSafe.totalCompanies,
      delta: currentSafe.totalCompanies - previousSafe.totalCompanies,
      unit: "count",
    },
    {
      key: "active-clients",
      label: "Active Clients",
      value: currentSafe.activeClients,
      delta: currentSafe.activeClients - previousSafe.activeClients,
      unit: "count",
    },
    {
      key: "total-revenue",
      label: "Revenue",
      value: currentSafe.totalRevenue,
      delta: currentSafe.totalRevenue - previousSafe.totalRevenue,
      unit: "currency",
    },
    {
      key: "payment-success-rate",
      label: "Payment Success Rate",
      value: currentSafe.paymentSuccessRate,
      delta: currentSafe.paymentSuccessRate - previousSafe.paymentSuccessRate,
      unit: "percent",
    },
  ];
}

export function summarizeTrendTotals(points: DashboardAnalyticsTrendPoint[]): {
  campaigns: number;
  approvedCampaigns: number;
  activeCampaigns: number;
  purchaseOrders: number;
  transactions: number;
} {
  return points.reduce(
    (acc, point) => {
      acc.campaigns += point.campaigns;
      acc.approvedCampaigns += point.approvedCampaigns;
      acc.activeCampaigns += point.activeCampaigns;
      acc.purchaseOrders += point.purchaseOrders;
      acc.transactions += point.transactions;
      return acc;
    },
    {
      campaigns: 0,
      approvedCampaigns: 0,
      activeCampaigns: 0,
      purchaseOrders: 0,
      transactions: 0,
    },
  );
}
