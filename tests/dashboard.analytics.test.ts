import test from "node:test";
import assert from "node:assert/strict";
import {
  mapDashboardAnalyticsOverviewResponse,
  mapDashboardAnalyticsTrendsResponse,
} from "@/lib/adminApi";
import { buildDashboardKpiCards } from "@/app/admin/dashboard/analyticsViewModel";

test("mapDashboardAnalyticsOverviewResponse normalizes backend shape", () => {
  const mapped = mapDashboardAnalyticsOverviewResponse({
    GeneratedAt: "2026-03-12T10:00:00Z",
    ActiveCampaigns: 12,
    TotalCompanies: 8,
    ActiveClients: 240,
    TotalRevenue: 9340.5,
    PaymentSuccessRate: 92.2,
  });

  assert.equal(mapped.activeCampaigns, 12);
  assert.equal(mapped.totalCompanies, 8);
  assert.equal(mapped.activeClients, 240);
  assert.equal(mapped.totalRevenue, 9340.5);
  assert.equal(mapped.paymentSuccessRate, 92.2);
});

test("mapDashboardAnalyticsTrendsResponse maps points and bucket", () => {
  const mapped = mapDashboardAnalyticsTrendsResponse({
    Bucket: "day",
    Points: [
      {
        BucketStart: "2026-03-10T00:00:00Z",
        Campaigns: 4,
        ApprovedCampaigns: 3,
        ActiveCampaigns: 2,
        PurchaseOrders: 5,
        Transactions: 4,
      },
    ],
  });

  assert.equal(mapped.bucket, "day");
  assert.equal(mapped.points.length, 1);
  assert.equal(mapped.points[0].campaigns, 4);
  assert.equal(mapped.points[0].transactions, 4);
});

test("buildDashboardKpiCards computes period deltas", () => {
  const cards = buildDashboardKpiCards(
    {
      generatedAt: "2026-03-12T10:00:00Z",
      activeCampaigns: 10,
      totalCompanies: 4,
      activeClients: 120,
      totalRevenue: 5400,
      paymentSuccessRate: 90,
    },
    {
      generatedAt: "2026-03-12T10:00:00Z",
      activeCampaigns: 8,
      totalCompanies: 4,
      activeClients: 100,
      totalRevenue: 4000,
      paymentSuccessRate: 80,
    },
  );

  assert.equal(cards.length, 5);
  assert.equal(cards[0].delta, 2);
  assert.equal(cards[3].delta, 1400);
  assert.equal(cards[4].delta, 10);
});
