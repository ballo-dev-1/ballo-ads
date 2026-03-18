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
      campaignPerformance: {
        totalCampaigns: 10,
        completedCampaigns: 8,
        completionRate: 80,
        totalRecipients: 1000,
        dispatchedRecipients: 900,
        dispatchRate: 90,
        averageTimeToCompleteHours: 4,
        byChannel: [],
      },
      creditsFinance: {
        balances: { sms: 100, email: 50, whatsApp: 30, whatsAppUtility: 20 },
        purchaseOrders: { pending: 1, active: 3, failed: 0, depleted: 1, expired: 0 },
        totalRevenue: 5400,
        paymentSuccessRate: 90,
      },
      audience: {
        totalSubscribers: 120,
        newSubscribers: 20,
        activeSubscribers: 100,
        optInSms: 90,
        optInEmail: 80,
        optInWhatsApp: 60,
        bySubscriptionSource: [],
        byProvince: [],
      },
      apiOps: {
        apiUsage: {
          total: 400,
          successCount: 360,
          failureCount: 40,
          successRate: 90,
          byChannel: [],
        },
        channelOperations: {
          pendingRecipients: 10,
          dispatchedLast24Hours: 120,
          failedApiUsagesLast24Hours: 5,
        },
      },
    },
    {
      generatedAt: "2026-03-12T10:00:00Z",
      activeCampaigns: 8,
      totalCompanies: 4,
      activeClients: 100,
      totalRevenue: 4000,
      paymentSuccessRate: 80,
      campaignPerformance: {
        totalCampaigns: 8,
        completedCampaigns: 6,
        completionRate: 75,
        totalRecipients: 800,
        dispatchedRecipients: 680,
        dispatchRate: 85,
        averageTimeToCompleteHours: 5,
        byChannel: [],
      },
      creditsFinance: {
        balances: { sms: 80, email: 40, whatsApp: 20, whatsAppUtility: 10 },
        purchaseOrders: { pending: 2, active: 2, failed: 1, depleted: 1, expired: 0 },
        totalRevenue: 4000,
        paymentSuccessRate: 80,
      },
      audience: {
        totalSubscribers: 100,
        newSubscribers: 15,
        activeSubscribers: 82,
        optInSms: 70,
        optInEmail: 65,
        optInWhatsApp: 50,
        bySubscriptionSource: [],
        byProvince: [],
      },
      apiOps: {
        apiUsage: {
          total: 300,
          successCount: 240,
          failureCount: 60,
          successRate: 80,
          byChannel: [],
        },
        channelOperations: {
          pendingRecipients: 20,
          dispatchedLast24Hours: 100,
          failedApiUsagesLast24Hours: 12,
        },
      },
    },
  );

  assert.equal(cards.length, 5);
  assert.equal(cards[0].delta, 2);
  assert.equal(cards[3].delta, 1400);
  assert.equal(cards[4].delta, 10);
});
