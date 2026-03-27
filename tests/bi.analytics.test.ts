import test from "node:test";
import assert from "node:assert/strict";
import {
  mapDashboardAnalyticsAnomaliesResponse,
  mapDashboardAnalyticsForecastResponse,
  mapDashboardAnalyticsRetentionResponse,
} from "@/lib/adminApi";
import {
  buildBiKpiCards,
  mapForecastSeriesForChart,
  summarizeAnomalySeverity,
} from "@/app/admin/bi-dashboard/biViewModel";

test("mapDashboardAnalyticsRetentionResponse maps retention rows", () => {
  const mapped = mapDashboardAnalyticsRetentionResponse({
    Cohorts: [
      {
        CohortMonth: "2026-01",
        CohortSize: 100,
        RetentionPoints: [
          { MonthIndex: 0, RetentionRate: 100, ActiveUsers: 100 },
          { MonthIndex: 1, RetentionRate: 74.3, ActiveUsers: 74 },
        ],
      },
    ],
  });

  assert.equal(mapped.cohorts.length, 1);
  assert.equal(mapped.cohorts[0].cohortMonth, "2026-01");
  assert.equal(mapped.cohorts[0].retentionPoints[1].retentionRate, 74.3);
});

test("mapDashboardAnalyticsForecastResponse normalizes confidence bands", () => {
  const mapped = mapDashboardAnalyticsForecastResponse({
    Bucket: "week",
    Points: [
      {
        BucketStart: "2026-03-01T00:00:00Z",
        ActualValue: 2000,
        PredictedValue: 2150,
        LowerBound: 1900,
        UpperBound: 2400,
      },
    ],
  });

  assert.equal(mapped.bucket, "week");
  assert.equal(mapped.points[0].predictedValue, 2150);
  assert.equal(mapped.points[0].upperBound, 2400);
});

test("mapDashboardAnalyticsAnomaliesResponse maps anomaly metadata", () => {
  const mapped = mapDashboardAnalyticsAnomaliesResponse({
    GeneratedAt: "2026-03-27T10:00:00Z",
    Alerts: [
      {
        AlertId: "a1",
        Metric: "transactionFailureRate",
        Severity: "critical",
        ExpectedValue: 2.5,
        ActualValue: 6.1,
        DeviationPercent: 144,
        ObservedAt: "2026-03-27T08:00:00Z",
      },
    ],
  });

  assert.equal(mapped.alerts.length, 1);
  assert.equal(mapped.alerts[0].metric, "transactionFailureRate");
  assert.equal(mapped.alerts[0].severity, "critical");
});

test("buildBiKpiCards computes deltas between periods", () => {
  const cards = buildBiKpiCards(
    {
      revenue: 1000,
      dispatchRate: 85,
      conversionRate: 22,
      retentionRate: 63,
      failureRate: 3.5,
    },
    {
      revenue: 800,
      dispatchRate: 81,
      conversionRate: 20,
      retentionRate: 60,
      failureRate: 2.2,
    },
  );

  assert.equal(cards.length, 5);
  assert.equal(cards[0].delta, 200);
  assert.ok(Math.abs(cards[4].delta - 1.3) < 1e-9);
});

test("mapForecastSeriesForChart returns chart-safe rows", () => {
  const chartRows = mapForecastSeriesForChart([
    {
      bucketStart: "2026-03-01T00:00:00Z",
      actualValue: 100,
      predictedValue: 110,
      lowerBound: 90,
      upperBound: 120,
    },
  ]);

  assert.equal(chartRows.length, 1);
  assert.equal(chartRows[0].actual, 100);
  assert.equal(chartRows[0].upper, 120);
});

test("summarizeAnomalySeverity counts anomalies by severity", () => {
  const summary = summarizeAnomalySeverity([
    {
      alertId: "1",
      metric: "conversionRate",
      severity: "high",
      expectedValue: 4,
      actualValue: 2,
      deviationPercent: -50,
      observedAt: "2026-03-01T00:00:00Z",
    },
    {
      alertId: "2",
      metric: "failureRate",
      severity: "critical",
      expectedValue: 1,
      actualValue: 3,
      deviationPercent: 200,
      observedAt: "2026-03-02T00:00:00Z",
    },
  ]);

  assert.equal(summary.high, 1);
  assert.equal(summary.critical, 1);
  assert.equal(summary.total, 2);
});
