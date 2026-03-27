import type {
  BiAnomalySeverity,
  DashboardAnalyticsAnomalyAlert,
  DashboardAnalyticsForecastPoint,
  DashboardAnalyticsDrilldownRow,
} from "@/lib/adminApi";

export type BiKpiSnapshot = {
  revenue: number;
  dispatchRate: number;
  conversionRate: number;
  retentionRate: number;
  failureRate: number;
};

export type BiKpiCard = {
  key: string;
  label: string;
  value: number;
  delta: number;
  unit: "currency" | "percent";
};

export function buildBiKpiCards(current: BiKpiSnapshot, previous: BiKpiSnapshot): BiKpiCard[] {
  return [
    { key: "revenue", label: "Revenue", value: current.revenue, delta: current.revenue - previous.revenue, unit: "currency" },
    { key: "dispatchRate", label: "Dispatch Rate", value: current.dispatchRate, delta: current.dispatchRate - previous.dispatchRate, unit: "percent" },
    { key: "conversionRate", label: "Conversion Rate", value: current.conversionRate, delta: current.conversionRate - previous.conversionRate, unit: "percent" },
    { key: "retentionRate", label: "Retention Rate", value: current.retentionRate, delta: current.retentionRate - previous.retentionRate, unit: "percent" },
    { key: "failureRate", label: "Failure Rate", value: current.failureRate, delta: current.failureRate - previous.failureRate, unit: "percent" },
  ];
}

export function mapForecastSeriesForChart(points: DashboardAnalyticsForecastPoint[]): Array<{
  bucketStart: string;
  actual: number;
  predicted: number;
  lower: number;
  upper: number;
}> {
  return points.map((point) => ({
    bucketStart: point.bucketStart,
    actual: point.actualValue,
    predicted: point.predictedValue,
    lower: point.lowerBound,
    upper: point.upperBound,
  }));
}

export function summarizeAnomalySeverity(
  alerts: DashboardAnalyticsAnomalyAlert[],
): Record<BiAnomalySeverity | "total", number> {
  const summary: Record<BiAnomalySeverity | "total", number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
    total: 0,
  };
  for (const alert of alerts) {
    summary[alert.severity] += 1;
    summary.total += 1;
  }
  return summary;
}

export function toDrilldownCsv(rows: DashboardAnalyticsDrilldownRow[]): string {
  const header = [
    "Bucket Start",
    "Company ID",
    "Company Name",
    "Channel",
    "Revenue",
    "Messages Sent",
    "Conversions",
    "Conversion Rate",
    "Failure Rate",
  ];
  const body = rows.map((row) =>
    [
      row.bucketStart,
      row.companyId ?? "",
      row.companyName ?? "",
      row.channel ?? "",
      row.revenue,
      row.messagesSent,
      row.conversions,
      row.conversionRate,
      row.failureRate,
    ].join(","),
  );
  return [header.join(","), ...body].join("\n");
}
