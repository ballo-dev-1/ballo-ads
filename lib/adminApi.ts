import { getAdminEnv } from "@/lib/adminNamespace";

/** Dev = local or dev server; Prod = production API. Backoffice uses Backoffice/* on both. */
export const DEV_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEV_API_URL
    ? process.env.NEXT_PUBLIC_DEV_API_URL
    : "https://dev-api.balloads.com";
export const STAGING_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_STAGING_API_URL
    ? process.env.NEXT_PUBLIC_STAGING_API_URL
    : "https://staging-api.balloads.com";
export const PROD_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_PROD_API_URL
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : "https://api.balloads.com";

const BACKOFFICE = "Backoffice";

function inferEnvFromPathname(
  pathname: string | null | undefined,
): "dev" | "staging" | "prod" {
  if (typeof window !== "undefined") {
    return getAdminEnv({
      pathname,
      host: window.location.hostname,
    });
  }
  return getAdminEnv({ pathname });
}

function inferBaseUrlFromLocationPathname(pathname: string | null | undefined): string {
  const env = inferEnvFromPathname(pathname);
  if (env === "dev") return DEV_API_BASE;
  if (env === "staging") return STAGING_API_BASE;
  return PROD_API_BASE;
}

let currentBaseUrl =
  typeof window !== "undefined"
    ? inferBaseUrlFromLocationPathname(window.location.pathname)
    : PROD_API_BASE;

/** When set by ApiEnvProvider, requests use this to get the current base URL from React state (avoids stale module variable when switching dev/prod). */
let baseUrlGetter: (() => string) | null = null;

export function registerBaseUrlGetter(getter: () => string): void {
  baseUrlGetter = getter;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && baseUrlGetter) {
    return baseUrlGetter().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return inferBaseUrlFromLocationPathname(window.location.pathname).replace(/\/+$/, "");
  }
  return currentBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  currentBaseUrl = url.replace(/\/+$/, "");
}

export type RoadmapPhaseStatus = "Pending" | "InProgress" | "Completed";
export type RoadmapFeaturePriority = "Low" | "Medium" | "High";
export type RoadmapFeatureStatus =
  | "Pending"
  | "InProgress"
  | "PartiallyDone"
  | "Done"
  | "Cancelled";
export type RoadmapMilestoneStatus = "Pending" | "Reached" | "Missed";

export type RoadmapFeatureResponse = {
  id: number;
  phaseId: number;
  parentFeatureId?: number;
  name: string;
  userStory: string;
  description?: string;
  priority: RoadmapFeaturePriority;
  status: RoadmapFeatureStatus;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualCompletionDate?: string;
  displayOrder: number;
  statusNotes?: string;
  createdAt: string;
  updatedAt: string;
  subFeatures: RoadmapFeatureResponse[];
};

export type RoadmapMilestoneResponse = {
  id: number;
  phaseId?: number;
  title: string;
  userStory: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: RoadmapMilestoneStatus;
  createdAt: string;
  updatedAt: string;
};

export type RoadmapPhaseResponse = {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  targetCompletionDate?: string;
  status: RoadmapPhaseStatus;
  createdAt: string;
  updatedAt: string;
  features: RoadmapFeatureResponse[];
  milestones: RoadmapMilestoneResponse[];
};

export type RoadmapOverviewResponse = {
  phases: RoadmapPhaseResponse[];
  totalFeatures: number;
  doneFeatures: number;
  inProgressFeatures: number;
  pendingFeatures: number;
};

export type RoadmapPhaseRequest = {
  name: string;
  description?: string;
  displayOrder?: number;
  targetCompletionDate?: string;
  status?: RoadmapPhaseStatus;
};

export type RoadmapFeatureRequest = {
  parentFeatureId?: number;
  name: string;
  userStory: string;
  description?: string;
  priority?: RoadmapFeaturePriority;
  status?: RoadmapFeatureStatus;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualCompletionDate?: string;
  displayOrder?: number;
  statusNotes?: string;
};

export type RoadmapMilestoneRequest = {
  phaseId?: number;
  title: string;
  userStory: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status?: RoadmapMilestoneStatus;
};

export type AuthResponse = {
  token: string;
  refreshToken: string;
};

export type BackofficeRoleResponse = {
  id: number;
  name: string;
  permissions: string[];
};

export type BackofficeUserResponse = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
};

export type MtnReviewerAccountResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
};

export type PurchaseOrderResponse = {
  id?: number;
  company?: CompanyLeanResponse;
  actor?: { id?: number; user?: Record<string, unknown> };
  smsCount?: number;
  emailCount?: number;
  whatsAppCount?: number;
  whatsAppUtilityCount?: number;
  billedAccount?: string;
  purchaseOrderStatus?: string;
  expirationAt?: string;
  createdAt?: string;
  updatedAt?: string;
  purchaseOrderType?: string;
};

export type ApiClientResponse = {
  id: number;
  companyId: number;
  name: string;
  keyPrefix: string;
  apiKey?: string;
  isTestKey: boolean;
  isRevoked: boolean;
  requestsPerMinuteLimit?: number;
  allowedChannels: string[];
  createdAt: string;
};

export type ApiClientCreateResponse = ApiClientResponse & {
  apiKey: string;
};

export type CreateApiClientRequest = {
  name: string;
  allowedChannels: string[];
  requestsPerMinuteLimit?: number;
  isTestKey?: boolean;
};

export type ManualCreditAllocationRequest = {
  smsCount: number;
  emailCount: number;
  whatsAppCount: number;
  whatsAppUtilityCount: number;
  notes?: string;
  durationDays?: number;
};

export type ApiCreditBalanceResponse = {
  smsCount: number;
  emailCount: number;
  whatsAppCount: number;
  whatsAppUtilityCount: number;
};

export type ApiUsageSummary = {
  total: number;
  successCount: number;
  failureCount: number;
  byChannel: Record<string, number>;
};

export type ApmReadinessItem = {
  provider: string;
  isConfigured: boolean;
  severity: ApmSeverity;
};

export type ApmSeverity = "ok" | "warning" | "critical";

export type ApmOverviewResponse = {
  providerVerificationMode: string;
  currentEnvironment: string;
  generatedAt: string;
  severity: ApmSeverity;
  heartbeat: {
    instanceId: string;
    startedAt: string;
    lastSeenAt: string;
  };
  localMetrics: {
    environment: string;
    uptimeSeconds: number;
    severity: ApmSeverity;
    database: {
      canConnect: boolean;
      connectivityLatencyMs: number;
      sampleQueryLatencyMs: number;
      severity: ApmSeverity;
    };
    scheduler: {
      storageType: string;
      recurringJobsCount: number;
      enqueuedCount: number;
      processingCount: number;
      failedCount: number;
      scheduledCount: number;
      severity: ApmSeverity;
    };
    operationalKpis: {
      activeCampaigns: number;
      pendingCampaigns: number;
      completedCampaignsLast24Hours: number;
      activePurchaseOrders: number;
      failedPurchaseOrdersLast24Hours: number;
      apiUsageFailuresLast24Hours: number;
      smsBalance: number;
      emailBalance: number;
      whatsAppBalance: number;
      whatsAppUtilityBalance: number;
    };
    thirdPartyReadiness: {
      sms: ApmReadinessItem;
      whatsApp: ApmReadinessItem;
      email: ApmReadinessItem;
      payments: ApmReadinessItem;
    };
  };
  environmentProbes: Array<{
    environment: string;
    baseUrl: string;
    isReachable: boolean;
    statusCode: number | null;
    latencyMs: number;
    severity: ApmSeverity;
  }>;
};

export type ApmChannelHealthResponse = {
  generatedAt: string;
  severity: ApmSeverity;
  channels: Array<{
    channel: string;
    pendingRecipients: number;
    dispatchedLast24Hours: number;
    failedApiUsagesLast24Hours: number;
    severity: ApmSeverity;
  }>;
};

export type ApmLinksResponse = {
  production: {
    environment: string;
    apiBaseUrl: string;
    hangfireDashboardUrl: string;
    seqUrl: string;
    grafanaUrl?: string;
  };
  staging: {
    environment: string;
    apiBaseUrl: string;
    hangfireDashboardUrl: string;
    seqUrl: string;
    grafanaUrl?: string;
  };
};

export type DispatchChannelControl = {
  channel: string;
  isPaused: boolean;
};

export type DispatchControlResponse = {
  environment: string;
  isGloballyPaused: boolean;
  channels: DispatchChannelControl[];
  updatedAt: string;
};

export type SchedulerRecurringJobResponse = {
  jobId: string;
  cron: string;
  description: string;
  queue: string;
  lastJobState?: string;
  lastExecution?: string;
  nextExecution?: string;
  error?: string;
  isScheduled: boolean;
};

export type SchedulerRecurringJobsResponse = {
  generatedAt: string;
  jobs: SchedulerRecurringJobResponse[];
};

export type SchedulerRecurringJobActionResponse = {
  jobId: string;
  action: "pause" | "resume" | "cancel";
  isScheduled: boolean;
  updatedAt: string;
};

export type ReliabilityAlertSeverity = "critical" | "high" | "medium" | "warning" | "ok";

export type ReliabilityAlert = {
  alertKey: string;
  type: string;
  severity: ReliabilityAlertSeverity;
  title: string;
  description: string;
  channel?: string;
  environment?: string;
  observedAt: string;
  acknowledged?: boolean;
};

export type ApmAlertsResponse = {
  generatedAt: string;
  counters: {
    open: number;
    critical: number;
    high: number;
    medium: number;
  };
  alerts: ReliabilityAlert[];
};

export type DashboardAnalyticsOverviewResponse = {
  generatedAt: string;
  appliedFilters: {
    from: string;
    to: string;
    companyId?: number;
    channel?: string;
  };
  activeCampaigns: number;
  totalCompanies: number;
  activeClients: number;
  totalMessagesSent: number;
  totalRevenue: number;
  paymentSuccessRate: number;
  campaignPerformance: DashboardAnalyticsCampaignPerformanceResponse;
  creditsFinance: DashboardAnalyticsCreditsFinanceResponse;
  audience: DashboardAnalyticsAudienceResponse;
  apiOps: DashboardAnalyticsApiOpsResponse;
};

export type DashboardAnalyticsOverviewComparisonResponse = {
  current: DashboardAnalyticsOverviewResponse;
  previous: DashboardAnalyticsOverviewResponse;
};

export type DashboardAnalyticsTrendPoint = {
  bucketStart: string;
  campaigns: number;
  approvedCampaigns: number;
  activeCampaigns: number;
  purchaseOrders: number;
  transactions: number;
};

export type DashboardAnalyticsTrendsResponse = {
  bucket: "day" | "week";
  points: DashboardAnalyticsTrendPoint[];
};

export type DashboardAnalyticsFunnelResponse = {
  created: number;
  approved: number;
  activated: number;
  completed: number;
  completionRate: number;
};

export type DashboardAnalyticsModerationResponse = {
  pendingApprovals: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  medianReviewHours: number;
};

export type DashboardAnalyticsCohortRetentionPoint = {
  monthIndex: number;
  retentionRate: number;
  activeUsers: number;
};

export type DashboardAnalyticsRetentionCohort = {
  cohortMonth: string;
  cohortSize: number;
  retentionPoints: DashboardAnalyticsCohortRetentionPoint[];
};

export type DashboardAnalyticsRetentionResponse = {
  cohorts: DashboardAnalyticsRetentionCohort[];
};

export type DashboardAnalyticsForecastPoint = {
  bucketStart: string;
  actualValue: number;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
};

export type DashboardAnalyticsForecastResponse = {
  bucket: "day" | "week";
  points: DashboardAnalyticsForecastPoint[];
};

export type BiAnomalySeverity = "low" | "medium" | "high" | "critical";

export type DashboardAnalyticsAnomalyAlert = {
  alertId: string;
  metric: string;
  severity: BiAnomalySeverity;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  observedAt: string;
};

export type DashboardAnalyticsAnomaliesResponse = {
  generatedAt: string;
  alerts: DashboardAnalyticsAnomalyAlert[];
};

export type DashboardAnalyticsDrilldownRow = {
  bucketStart: string;
  companyId?: number;
  companyName?: string;
  channel?: string;
  revenue: number;
  messagesSent: number;
  conversions: number;
  conversionRate: number;
  failureRate: number;
};

export type DashboardAnalyticsDrilldownResponse = {
  rows: DashboardAnalyticsDrilldownRow[];
};

export type DashboardAnalyticsBreakdownPoint = {
  label: string;
  value: number;
};

export type DashboardAnalyticsCampaignPerformanceByChannel = {
  channel: string;
  campaigns: number;
  completedCampaigns: number;
  completionRate: number;
  totalRecipients: number;
  dispatchedRecipients: number;
  dispatchRate: number;
};

export type DashboardAnalyticsCampaignPerformanceResponse = {
  totalCampaigns: number;
  completedCampaigns: number;
  completionRate: number;
  totalRecipients: number;
  dispatchedRecipients: number;
  dispatchRate: number;
  averageTimeToCompleteHours: number;
  byChannel: DashboardAnalyticsCampaignPerformanceByChannel[];
};

export type DashboardAnalyticsCreditsFinanceResponse = {
  balances: {
    sms: number;
    email: number;
    whatsApp: number;
    whatsAppUtility: number;
  };
  purchaseOrders: {
    pending: number;
    active: number;
    failed: number;
    depleted: number;
    expired: number;
  };
  totalRevenue: number;
  paymentSuccessRate: number;
};

export type DashboardAnalyticsAudienceResponse = {
  totalSubscribers: number;
  newSubscribers: number;
  activeSubscribers: number;
  optInSms: number;
  optInEmail: number;
  optInWhatsApp: number;
  bySubscriptionSource: DashboardAnalyticsBreakdownPoint[];
  byProvince: DashboardAnalyticsBreakdownPoint[];
};

export type DashboardAnalyticsApiOpsResponse = {
  apiUsage: {
    total: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    byChannel: DashboardAnalyticsBreakdownPoint[];
  };
  channelOperations: {
    pendingRecipients: number;
    dispatchedLast24Hours: number;
    failedApiUsagesLast24Hours: number;
  };
};

export type ReliabilityNotificationPayload = {
  title: string;
  message: string;
  type: "reliability_alert";
  link: string;
  dedupeKey: string;
  severity: ReliabilityAlertSeverity;
  metadata: Record<string, unknown>;
};

export type TransactionResponse = {
  id: number;
  transactionId: string;
  externalId?: string;
  amount: number;
  currency?: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
};

export type TransactionsWalletBalanceResponse = {
  balance: number;
};

export type TumaniBalanceResponse = {
  holderId: string;
  balance: number;
};

export type AdsClientResponse = {
  id: number;
  email?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  province?: string;
  city?: string;
  town?: string;
  status?: string;
  optInSMS?: boolean;
  optInEmail?: boolean;
  optInWhatsApp?: boolean;
  companyName?: string;
};

export type CompanyCampaignApprovalOverrideRequest = {
  /** Use `null` to clear override and inherit platform default. */
  requireCampaignApprovalOverride?: boolean | null;
};

export type CompanyWhatsAppCredentialMaskedResponse = {
  id: number;
  companyId: number;
  isTestKey: boolean;
  isActive: boolean;
  phoneNumberId: string;
  businessAccountId?: string | null;
  graphApiBaseUrl?: string | null;
  accessTokenConfigured: boolean;
  appSecretConfigured: boolean;
  verifyTokenConfigured: boolean;
  marketingTemplateName?: string | null;
  marketingTemplateLanguage?: string | null;
  defaultMarketingImageUrl?: string | null;
  utilityTemplateName?: string | null;
  utilityTemplateLanguage?: string | null;
  utilityButtonParameter?: string | null;
  createdAt: string;
  updatedAt: string;
  /** True when the API returns environment WhatsAppSettings (no active company row). */
  usesPlatformDefaults: boolean;
};

export type WhatsAppTemplateCatalogItem = {
  name: string;
  language: string;
  category?: string | null;
  status: string;
  /** Meta template `components` (HEADER/BODY/BUTTONS) when the API returns them. */
  components?: unknown;
};

export type CompanyWhatsAppCredentialUpsertRequest = {
  isTestKey: boolean;
  isActive: boolean;
  phoneNumberId: string;
  businessAccountId?: string | null;
  graphApiBaseUrl?: string | null;
  /** Omit or leave empty to keep existing encrypted value. */
  accessToken?: string | null;
  appSecret?: string | null;
  verifyToken?: string | null;
  marketingTemplateName?: string | null;
  marketingTemplateLanguage?: string | null;
  defaultMarketingImageUrl?: string | null;
  utilityTemplateName?: string | null;
  utilityTemplateLanguage?: string | null;
  utilityButtonParameter?: string | null;
};

export type CompanyLeanResponse = {
  id: number;
  name?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  physicalAddress?: string;
  industry: string;
  isCompanyVerified: boolean;
  websiteUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  senderId?: string;
  profileImageUrl?: string;
  registrationDocumentUrl?: string;
  signatureImageUrl?: string;
  isApprovedSenderId: boolean;
  isApprovedSenderIdMtn?: boolean;
  isApprovedSenderIdAirtel?: boolean;
  isApprovedSenderIdZamtel?: boolean;
  isApprovedSenderIdZedmobile?: boolean;
  reviewStatus?: CompanyReviewStatus;
  reviewReason?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
  deactivatedAt?: string;
  /** `null`/`undefined` = inherit platform default */
  requireCampaignApprovalOverride?: boolean | null;
  effectiveRequireCampaignApproval: boolean;
};

export type CompanyReviewStatus = "Pending" | "Approved" | "Rejected";

/** MNO keys accepted for submit-to-MNOs flows */
export type CompanyMnoNetworkKey = "Mtn" | "Airtel" | "Zamtel" | "Zedmobile";

export type SubmitCompanyToMnosPayload = {
  networks: CompanyMnoNetworkKey[];
  submissionType: "review-dashboard" | "generated-letter";
  recipientEmail?: string;
  recipientName?: string;
  cc?: string[];
  bcc?: string[];
  forceRegenerate?: boolean;
  useStoredSnapshot?: boolean;
  letterHtmlOverride?: string;
  emailSubjectOverride?: string;
  emailBodyHtmlOverride?: string;
  emailPreviewBody?: string;
};

export type CompanyMnoSubmissionHistoryItem = {
  id: string;
  submittedAt: string;
  submissionType: string;
  status: string;
  networks: string[];
  submittedRecipientEmail?: string;
  submittedCc: string[];
  submittedBcc: string[];
  submittedEmailSubject?: string;
  submittedEmailBodyHtml?: string;
  submittedLetterHtml?: string;
  submittedByUserId?: number;
  reviewMessage?: string;
  reviewAttachments: string[];
  reviewedByReviewerId?: number;
  reviewedAt?: string;
};

export type CompanyMemberRole = "Member" | "Admin" | "SuperAdmin";

export type CompanyMemberResponse = {
  id: number;
  role: CompanyMemberRole;
  companyRoleId?: number;
  companyRoleName?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
};

export type CreateCompanyInviteRequest = {
  email: string;
  role: CompanyMemberRole;
  roleId?: number;
};

export type CreateCompanyInviteResponse = {
  id: number;
  companyId: number;
  companyName: string;
  email: string;
  role: CompanyMemberRole;
  status: string;
  expiresAt: string;
  token: string;
};

export type NetworkDispatchSummary = {
  sentCount: number;
  pendingSenderIdCount: number;
  pendingCount: number;
  failedCount: number;
  pendingNetworks: string[];
};

export type CampaignRecipientResponse = {
  id: number;
  account: string;
  channel: string;
  messageDispatched: boolean;
  status: string;
  attemptCount: number;
  nextAttemptAt?: string;
  claimedAt?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdAt?: string;
  purchaseOrderId?: number;
  name?: string;
  updatedAt?: string;
};

export type AdsCampaignResponse = {
  id: number;
  name: string;
  campaignMessage: string;
  campaignPurpose: string;
  campaignChannel: string;
  companyId: number;
  creatorId: number;
  startDate: string;
  endDate: string;
  status: string;
  mediaFileUrl?: string;
  isApproved: boolean;
  recipients?: CampaignRecipientResponse[];
  networkDispatchSummary?: NetworkDispatchSummary;
};

export type CampaignLogResponse = {
  id: number;
  campaignId: number;
  actorFirstName?: string;
  actorLastName?: string;
  initialStatus?: string;
  finalStatus?: string;
};

export type RetargetResponse = {
  retargetedCount: number;
  stillPendingCount: number;
  pendingNetworks: string[];
};

export type PlatformSettingsResponse = {
  id?: number;
  requireCampaignApproval: boolean;
  requireSenderIdApproval: boolean;
  mnoSenderIdRequestReplyToEmailPrimary: string;
  mnoSenderIdRequestReplyToEmailSecondary: string;
};

export type PlatformSettingsUpdateRequest = {
  requireCampaignApproval?: boolean;
  requireSenderIdApproval?: boolean;
  mnoSenderIdRequestReplyToEmailPrimary?: string;
  mnoSenderIdRequestReplyToEmailSecondary?: string;
};

export type PricingPlatform = "Sms" | "Email" | "WhatsApp" | "WhatsAppUtility";

export type PricingModelResponse = {
  id: number;
  platform: PricingPlatform;
  thresholdStart: number;
  thresholdEnd: number;
  amountPerMessage: number;
  duration: number;
  isEnabled: boolean;
  createdAt: string;
};

export type PricingLadderRateResponse = {
  id: number;
  bandId: number;
  platform: PricingPlatform;
  amountPerMessage: number;
  isEnabled: boolean;
};

export type PricingLadderBandResponse = {
  id: number;
  duration: number;
  thresholdStart: number;
  thresholdEnd: number;
  displayOrder: number;
  isEnabled: boolean;
  rates: PricingLadderRateResponse[];
};

export type PricingLadderRateRequest = {
  platform: PricingPlatform;
  amountPerMessage: number;
  isEnabled?: boolean;
};

export type PricingLadderBandRequest = {
  thresholdStart: number;
  thresholdEnd: number;
  displayOrder: number;
  isEnabled?: boolean;
  rates: PricingLadderRateRequest[];
};

export type PricingLadderUpsertRequest = {
  duration: number;
  bands: PricingLadderBandRequest[];
};

function mapPricingResponse(r: Record<string, unknown>): PricingModelResponse {
  return {
    id: Number(r.Id ?? r.id ?? 0),
    platform: (r.Platform ?? r.platform) as PricingPlatform,
    thresholdStart: Number(r.ThresholdStart ?? r.thresholdStart ?? 0),
    thresholdEnd: Number(r.ThresholdEnd ?? r.thresholdEnd ?? 0),
    amountPerMessage: Number(r.AmountPerMessage ?? r.amountPerMessage ?? 0),
    duration: Number(r.Duration ?? r.duration ?? 0),
    isEnabled: Boolean(r.IsEnabled ?? r.isEnabled ?? true),
    createdAt: String(r.CreatedAt ?? r.createdAt ?? ""),
  };
}

export type MtnWhitelistedSenderIdResponse = {
  id: number;
  senderId: string;
  createdAt: string;
};

export type MtnWhitelistedSenderIdRequest = {
  senderId: string;
};

export type SmsProviderRouteResponse = {
  id: number;
  providerKey: string;
  predicateType: string;
  predicateValue?: string | null;
  priority: number;
  isActive: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SmsProviderRouteRequest = {
  providerKey: string;
  predicateType: string;
  predicateValue?: string | null;
  priority: number;
  isActive: boolean;
};

/** Normalize company response from backend (PascalCase or camelCase) to CompanyLeanResponse */
function mapCompanyLeanResponse(
  r: Record<string, unknown>,
): CompanyLeanResponse {
  return {
    id: (r.Id ?? r.id) as number,
    name: (r.Name ?? r.name) as string | undefined,
    description: (r.Description ?? r.description) as string | undefined,
    email: (r.Email ?? r.email) as string | undefined,
    phoneNumber: (r.PhoneNumber ?? r.phoneNumber) as string | undefined,
    physicalAddress: (r.PhysicalAddress ?? r.physicalAddress) as
      | string
      | undefined,
    industry: (r.Industry ?? r.industry) as string,
    isCompanyVerified: (r.IsCompanyVerified ?? r.isCompanyVerified) as boolean,
    websiteUrl: (r.WebsiteUrl ?? r.websiteUrl) as string | undefined,
    facebookUrl: (r.FacebookUrl ?? r.facebookUrl) as string | undefined,
    twitterUrl: (r.TwitterUrl ?? r.twitterUrl) as string | undefined,
    linkedInUrl: (r.LinkedInUrl ?? r.linkedInUrl) as string | undefined,
    instagramUrl: (r.InstagramUrl ?? r.instagramUrl) as string | undefined,
    youtubeUrl: (r.YoutubeUrl ?? r.youtubeUrl) as string | undefined,
    senderId: (r.SenderId ?? r.senderId) as string | undefined,
    profileImageUrl: (r.ProfileImageUrl ?? r.profileImageUrl) as
      | string
      | undefined,
    registrationDocumentUrl: (r.RegistrationDocumentUrl ??
      r.registrationDocumentUrl) as string | undefined,
    signatureImageUrl: (r.SignatureImageUrl ??
      r.signatureImageUrl) as string | undefined,
    isApprovedSenderId: (r.IsApprovedSenderId ??
      r.isApprovedSenderId) as boolean,
    isApprovedSenderIdMtn: (r.IsApprovedSenderIdMtn ??
      r.isApprovedSenderIdMtn) as boolean | undefined,
    isApprovedSenderIdAirtel: (r.IsApprovedSenderIdAirtel ??
      r.isApprovedSenderIdAirtel) as boolean | undefined,
    isApprovedSenderIdZamtel: (r.IsApprovedSenderIdZamtel ??
      r.isApprovedSenderIdZamtel) as boolean | undefined,
    isApprovedSenderIdZedmobile: (r.IsApprovedSenderIdZedmobile ??
      r.isApprovedSenderIdZedmobile) as boolean | undefined,
    reviewStatus: (r.ReviewStatus ?? r.reviewStatus) as CompanyReviewStatus | undefined,
    reviewReason: (r.ReviewReason ?? r.reviewReason) as string | undefined,
    createdAt: (r.CreatedAt ?? r.createdAt) as string | undefined,
    updatedAt: (r.UpdatedAt ?? r.updatedAt) as string | undefined,
    isActive: Boolean(r.IsActive ?? r.isActive ?? true),
    deactivatedAt: (r.DeactivatedAt ?? r.deactivatedAt) as string | undefined,
    requireCampaignApprovalOverride: (r.RequireCampaignApprovalOverride ??
      r.requireCampaignApprovalOverride) as boolean | null | undefined,
    effectiveRequireCampaignApproval: Boolean(
      r.EffectiveRequireCampaignApproval ?? r.effectiveRequireCampaignApproval ?? false,
    ),
  };
}

function mapCompanyWhatsAppCredentialMasked(
  r: Record<string, unknown>,
): CompanyWhatsAppCredentialMaskedResponse {
  return {
    id: Number(r.Id ?? r.id ?? 0),
    companyId: Number(r.CompanyId ?? r.companyId ?? 0),
    isTestKey: Boolean(r.IsTestKey ?? r.isTestKey),
    isActive: Boolean(r.IsActive ?? r.isActive ?? true),
    phoneNumberId: String(r.PhoneNumberId ?? r.phoneNumberId ?? ""),
    businessAccountId: (r.BusinessAccountId ?? r.businessAccountId) as
      | string
      | null
      | undefined,
    graphApiBaseUrl: (r.GraphApiBaseUrl ?? r.graphApiBaseUrl) as
      | string
      | null
      | undefined,
    accessTokenConfigured: Boolean(
      r.AccessTokenConfigured ?? r.accessTokenConfigured,
    ),
    appSecretConfigured: Boolean(
      r.AppSecretConfigured ?? r.appSecretConfigured,
    ),
    verifyTokenConfigured: Boolean(
      r.VerifyTokenConfigured ?? r.verifyTokenConfigured,
    ),
    marketingTemplateName: (r.MarketingTemplateName ??
      r.marketingTemplateName) as string | null | undefined,
    marketingTemplateLanguage: (r.MarketingTemplateLanguage ??
      r.marketingTemplateLanguage) as string | null | undefined,
    defaultMarketingImageUrl: (r.DefaultMarketingImageUrl ??
      r.defaultMarketingImageUrl) as string | null | undefined,
    utilityTemplateName: (r.UtilityTemplateName ??
      r.utilityTemplateName) as string | null | undefined,
    utilityTemplateLanguage: (r.UtilityTemplateLanguage ??
      r.utilityTemplateLanguage) as string | null | undefined,
    utilityButtonParameter: (r.UtilityButtonParameter ??
      r.utilityButtonParameter) as string | null | undefined,
    createdAt: String(r.CreatedAt ?? r.createdAt ?? ""),
    updatedAt: String(r.UpdatedAt ?? r.updatedAt ?? ""),
    usesPlatformDefaults: Boolean(
      r.UsesPlatformDefaults ?? r.usesPlatformDefaults,
    ),
  };
}

function mapWhatsAppTemplateCatalogItem(
  r: Record<string, unknown>,
): WhatsAppTemplateCatalogItem {
  const components = r.components ?? r.Components;
  return {
    name: String(r.name ?? r.Name ?? ""),
    language: String(r.language ?? r.Language ?? ""),
    category: (r.category ?? r.Category) as string | null | undefined,
    status: String(r.status ?? r.Status ?? ""),
    components:
      components !== undefined && components !== null
        ? (components as WhatsAppTemplateCatalogItem["components"])
        : undefined,
  };
}

/** Normalize ads client response (PascalCase or camelCase) to AdsClientResponse */
function mapAdsClientResponse(r: Record<string, unknown>): AdsClientResponse {
  return {
    id: (r.Id ?? r.id) as number,
    email: (r.Email ?? r.email) as string | undefined,
    phoneNumber: (r.PhoneNumber ?? r.phoneNumber) as string | undefined,
    firstName: (r.FirstName ?? r.firstName) as string,
    lastName: (r.LastName ?? r.lastName) as string,
    dateOfBirth: (r.DateOfBirth ?? r.dateOfBirth) as string | undefined,
    gender: (r.Gender ?? r.gender) as string | undefined,
    country: (r.Country ?? r.country) as string | undefined,
    province: (r.Province ?? r.province) as string | undefined,
    city: (r.City ?? r.city) as string | undefined,
    town: (r.Town ?? r.town) as string | undefined,
    status: (r.Status ?? r.status) as string | undefined,
    optInSMS: (r.OptInSMS ?? r.optInSMS) as boolean | undefined,
    optInEmail: (r.OptInEmail ?? r.optInEmail) as boolean | undefined,
    optInWhatsApp: (r.OptInWhatsApp ?? r.optInWhatsApp) as boolean | undefined,
    companyName: (r.CompanyName ?? r.companyName) as string | undefined,
  };
}

/** Normalize campaign response (PascalCase or camelCase) to AdsCampaignResponse */
function mapAdsCampaignResponse(
  r: Record<string, unknown>,
): AdsCampaignResponse {
  const summaryRaw =
    (r.NetworkDispatchSummary ?? r.networkDispatchSummary) as
      | Record<string, unknown>
      | undefined;
  const recipientsRaw = (r.Recipients ?? r.recipients) as unknown;

  return {
    id: (r.Id ?? r.id) as number,
    name: (r.Name ?? r.name) as string,
    campaignMessage: (r.CampaignMessage ?? r.campaignMessage) as string,
    campaignPurpose: (r.CampaignPurpose ?? r.campaignPurpose) as string,
    campaignChannel: (r.CampaignChannel ?? r.campaignChannel) as string,
    companyId: (r.CompanyId ?? r.companyId) as number,
    creatorId: (r.CreatorId ?? r.creatorId) as number,
    startDate: (r.StartDate ?? r.startDate) as string,
    endDate: (r.EndDate ?? r.endDate) as string,
    status: (r.Status ?? r.status) as string,
    mediaFileUrl: (r.MediaFileUrl ?? r.mediaFileUrl) as string | undefined,
    isApproved: (r.IsApproved ?? r.isApproved) as boolean,
    recipients: Array.isArray(recipientsRaw)
      ? recipientsRaw.map((item) => {
          const recipient = (item ?? {}) as Record<string, unknown>;
          return {
            id: Number(recipient.Id ?? recipient.id ?? 0),
            account: String(recipient.Account ?? recipient.account ?? ""),
            channel: String(recipient.Channel ?? recipient.channel ?? ""),
            messageDispatched: Boolean(
              recipient.MessageDispatched ?? recipient.messageDispatched ?? false,
            ),
            status: String(recipient.Status ?? recipient.status ?? "Pending"),
            attemptCount: Number(recipient.AttemptCount ?? recipient.attemptCount ?? 0),
            nextAttemptAt: (recipient.NextAttemptAt ?? recipient.nextAttemptAt) as string | undefined,
            claimedAt: (recipient.ClaimedAt ?? recipient.claimedAt) as string | undefined,
            lastErrorCode: (recipient.LastErrorCode ?? recipient.lastErrorCode) as string | undefined,
            lastErrorMessage: (recipient.LastErrorMessage ?? recipient.lastErrorMessage) as string | undefined,
            createdAt: (recipient.CreatedAt ?? recipient.createdAt) as string | undefined,
            purchaseOrderId: (recipient.PurchaseOrderId ?? recipient.purchaseOrderId) as number | undefined,
            name: (recipient.Name ?? recipient.name) as string | undefined,
            updatedAt: (recipient.UpdatedAt ?? recipient.updatedAt) as string | undefined,
          } satisfies CampaignRecipientResponse;
        })
      : [],
    networkDispatchSummary: summaryRaw
      ? {
          sentCount: Number(
            (summaryRaw.sentCount ?? summaryRaw.SentCount) as number ?? 0,
          ),
          pendingSenderIdCount: Number(
            (summaryRaw.pendingSenderIdCount ??
              summaryRaw.PendingSenderIdCount) as number ?? 0,
          ),
          pendingCount: Number(
            (summaryRaw.pendingCount ?? summaryRaw.PendingCount) as number ?? 0,
          ),
          failedCount: Number(
            (summaryRaw.failedCount ?? summaryRaw.FailedCount) as number ?? 0,
          ),
          pendingNetworks: (() => {
            const pendingNetworksValue =
              (summaryRaw as Record<string, unknown>)['pendingNetworks'] ??
              (summaryRaw as Record<string, unknown>)['PendingNetworks']
            return Array.isArray(pendingNetworksValue)
              ? pendingNetworksValue.map((x) => String(x))
              : []
          })(),
        }
      : undefined,
  };
}

/** Normalize campaign log (PascalCase or camelCase) to CampaignLogResponse */
function mapCampaignLogResponse(
  r: Record<string, unknown>,
): CampaignLogResponse {
  return {
    id: (r.Id ?? r.id) as number,
    campaignId: (r.CampaignId ?? r.campaignId) as number,
    actorFirstName: (r.ActorFirstName ?? r.actorFirstName) as
      | string
      | undefined,
    actorLastName: (r.ActorLastName ?? r.actorLastName) as string | undefined,
    initialStatus: (r.InitialStatus ?? r.initialStatus) as string | undefined,
    finalStatus: (r.FinalStatus ?? r.finalStatus) as string | undefined,
  };
}

function mapCompanyMemberResponse(r: Record<string, unknown>): CompanyMemberResponse {
  const userRaw = (r.User ?? r.user) as Record<string, unknown> | undefined;
  return {
    id: Number(r.Id ?? r.id ?? 0),
    role: String(r.Role ?? r.role ?? "Member") as CompanyMemberRole,
    companyRoleId: (r.CompanyRoleId ?? r.companyRoleId) as number | undefined,
    companyRoleName: (r.CompanyRoleName ?? r.companyRoleName) as string | undefined,
    user: userRaw
      ? {
          id: Number(userRaw.Id ?? userRaw.id ?? 0),
          firstName: (userRaw.FirstName ?? userRaw.firstName) as string | undefined,
          lastName: (userRaw.LastName ?? userRaw.lastName) as string | undefined,
          phoneNumber: (userRaw.PhoneNumber ?? userRaw.phoneNumber) as string | undefined,
          email: (userRaw.Email ?? userRaw.email) as string | undefined,
        }
      : undefined,
  };
}

function mapCompanyMnoSubmissionHistoryItem(
  r: Record<string, unknown>,
): CompanyMnoSubmissionHistoryItem {
  const submittedCcRaw = (r.SubmittedCc ?? r.submittedCc) as unknown;
  const submittedBccRaw = (r.SubmittedBcc ?? r.submittedBcc) as unknown;
  const networksRaw = (r.Networks ?? r.networks) as unknown;
  return {
    id: String(r.Id ?? r.id ?? ""),
    submittedAt: String(r.SubmittedAt ?? r.submittedAt ?? ""),
    submissionType: String(r.SubmissionType ?? r.submissionType ?? "generated-letter"),
    status: String(r.Status ?? r.status ?? "submitted"),
    networks: Array.isArray(networksRaw) ? networksRaw.map((x) => String(x)) : [],
    submittedRecipientEmail: (r.SubmittedRecipientEmail ?? r.submittedRecipientEmail) as string | undefined,
    submittedCc: Array.isArray(submittedCcRaw) ? submittedCcRaw.map((x) => String(x)) : [],
    submittedBcc: Array.isArray(submittedBccRaw) ? submittedBccRaw.map((x) => String(x)) : [],
    submittedEmailSubject: (r.SubmittedEmailSubject ?? r.submittedEmailSubject) as string | undefined,
    submittedEmailBodyHtml: (r.SubmittedEmailBodyHtml ?? r.submittedEmailBodyHtml) as string | undefined,
    submittedLetterHtml: (r.SubmittedLetterHtml ?? r.submittedLetterHtml) as string | undefined,
    submittedByUserId: (r.SubmittedByUserId ?? r.submittedByUserId) as number | undefined,
    reviewMessage: (r.ReviewMessage ?? r.reviewMessage) as string | undefined,
    reviewAttachments: Array.isArray(r.ReviewAttachments ?? r.reviewAttachments)
      ? ((r.ReviewAttachments ?? r.reviewAttachments) as unknown[]).map((x) => String(x))
      : [],
    reviewedByReviewerId: (r.ReviewedByReviewerId ?? r.reviewedByReviewerId) as number | undefined,
    reviewedAt: (r.ReviewedAt ?? r.reviewedAt) as string | undefined,
  };
}

function mapPricingLadderRateResponse(r: Record<string, unknown>): PricingLadderRateResponse {
  return {
    id: Number(r.Id ?? r.id ?? 0),
    bandId: Number(r.BandId ?? r.bandId ?? 0),
    platform: (r.Platform ?? r.platform) as PricingPlatform,
    amountPerMessage: Number(r.AmountPerMessage ?? r.amountPerMessage ?? 0),
    isEnabled: Boolean(r.IsEnabled ?? r.isEnabled ?? true),
  };
}

function mapPricingLadderBandResponse(r: Record<string, unknown>): PricingLadderBandResponse {
  const ratesRaw = (r.Rates ?? r.rates) as unknown;
  return {
    id: Number(r.Id ?? r.id ?? 0),
    duration: Number(r.Duration ?? r.duration ?? 0),
    thresholdStart: Number(r.ThresholdStart ?? r.thresholdStart ?? 0),
    thresholdEnd: Number(r.ThresholdEnd ?? r.thresholdEnd ?? 0),
    displayOrder: Number(r.DisplayOrder ?? r.displayOrder ?? 0),
    isEnabled: Boolean(r.IsEnabled ?? r.isEnabled ?? true),
    rates: Array.isArray(ratesRaw)
      ? ratesRaw.map((x) => mapPricingLadderRateResponse(x as Record<string, unknown>))
      : [],
  };
}

function legacyPricingRowsToLadder(
  rows: PricingModelResponse[],
  duration: number,
): PricingLadderBandResponse[] {
  const filtered = rows
    .filter((x) => x.duration === duration)
    .filter((x) => x.isEnabled);

  const grouped = new Map<string, PricingLadderBandResponse>();
  let nextBandId = 1;
  let nextRateId = 1;

  for (const row of filtered) {
    const key = `${row.thresholdStart}:${row.thresholdEnd}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        id: nextBandId++,
        duration,
        thresholdStart: row.thresholdStart,
        thresholdEnd: row.thresholdEnd,
        displayOrder: 0,
        isEnabled: true,
        rates: [],
      });
    }
    grouped.get(key)!.rates.push({
      id: nextRateId++,
      bandId: grouped.get(key)!.id,
      platform: row.platform,
      amountPerMessage: row.amountPerMessage,
      isEnabled: row.isEnabled,
    });
  }

  const ordered = Array.from(grouped.values()).sort((a, b) =>
    a.thresholdStart !== b.thresholdStart
      ? a.thresholdStart - b.thresholdStart
      : a.thresholdEnd - b.thresholdEnd,
  );

  return ordered.map((band, idx) => ({
    ...band,
    displayOrder: idx + 1,
    rates: platformsFromType().map((platform) => {
      const found = band.rates.find((x) => x.platform === platform);
      return (
        found ?? {
          id: nextRateId++,
          bandId: band.id,
          platform,
          amountPerMessage: 0,
          isEnabled: true,
        }
      );
    }),
  }));
}

function platformsFromType(): PricingPlatform[] {
  return ["Sms", "Email", "WhatsApp", "WhatsAppUtility"];
}

/** Normalize MTN whitelisted sender ID response (PascalCase) to camelCase */
function mapMtnWhitelistedSenderIdResponse(
  r: Record<string, unknown>,
): MtnWhitelistedSenderIdResponse {
  return {
    id: (r.Id ?? r.id) as number,
    senderId: (r.SenderId ?? r.senderId) as string,
    createdAt: (r.CreatedAt ?? r.createdAt) as string,
  };
}

function mapSmsProviderRouteResponse(
  r: Record<string, unknown>,
): SmsProviderRouteResponse {
  return {
    id: (r.Id ?? r.id) as number,
    providerKey: (r.ProviderKey ?? r.providerKey) as string,
    predicateType: (r.PredicateType ?? r.predicateType) as string,
    predicateValue: (r.PredicateValue ?? r.predicateValue) as string | null | undefined,
    priority: Number(r.Priority ?? r.priority ?? 0),
    isActive: Boolean(r.IsActive ?? r.isActive ?? true),
    messageCount: Number(r.MessageCount ?? r.messageCount ?? 0),
    createdAt: (r.CreatedAt ?? r.createdAt) as string,
    updatedAt: (r.UpdatedAt ?? r.updatedAt) as string,
  };
}

function mapApiClientResponse(r: Record<string, unknown>): ApiClientResponse {
  const channelsRaw = (r.AllowedChannels ?? r.allowedChannels) as unknown;
  return {
    id: (r.Id ?? r.id) as number,
    companyId: (r.CompanyId ?? r.companyId) as number,
    name: (r.Name ?? r.name) as string,
    keyPrefix: (r.KeyPrefix ?? r.keyPrefix) as string,
    apiKey: (r.ApiKey ?? r.apiKey) as string | undefined,
    isTestKey: Boolean(r.IsTestKey ?? r.isTestKey ?? false),
    isRevoked: (r.IsRevoked ?? r.isRevoked) as boolean,
    requestsPerMinuteLimit: (r.RequestsPerMinuteLimit ??
      r.requestsPerMinuteLimit) as number | undefined,
    allowedChannels: Array.isArray(channelsRaw)
      ? channelsRaw.map((x) => String(x))
      : [],
    createdAt: (r.CreatedAt ?? r.createdAt) as string,
  };
}

function mapApiClientCreateResponse(
  r: Record<string, unknown>,
): ApiClientCreateResponse {
  return {
    ...mapApiClientResponse(r),
    apiKey: (r.ApiKey ?? r.apiKey) as string,
  };
}

function mapApiUsageSummary(r: Record<string, unknown>): ApiUsageSummary {
  return {
    total: Number(r.Total ?? r.total ?? 0),
    successCount: Number(r.SuccessCount ?? r.successCount ?? 0),
    failureCount: Number(r.FailureCount ?? r.failureCount ?? 0),
    byChannel: ((r.ByChannel ?? r.byChannel) as Record<string, number>) ?? {},
  };
}

function mapApiCreditBalanceResponse(
  r: Record<string, unknown>,
): ApiCreditBalanceResponse {
  return {
    smsCount: Number(r.SmsCount ?? r.smsCount ?? 0),
    emailCount: Number(r.EmailCount ?? r.emailCount ?? 0),
    whatsAppCount: Number(r.WhatsAppCount ?? r.whatsAppCount ?? 0),
    whatsAppUtilityCount: Number(r.WhatsAppUtilityCount ?? r.whatsAppUtilityCount ?? 0),
  };
}

function mapApmReadinessItem(r: Record<string, unknown>): ApmReadinessItem {
  return {
    provider: String(r.Provider ?? r.provider ?? "Unknown"),
    isConfigured: Boolean(r.IsConfigured ?? r.isConfigured),
    severity: String(r.Severity ?? r.severity ?? "ok") as ApmSeverity,
  };
}

function mapApmOverviewResponse(r: Record<string, unknown>): ApmOverviewResponse {
  const localMetricsRaw = ((r.LocalMetrics ?? r.localMetrics) ?? {}) as Record<
    string,
    unknown
  >;
  const databaseRaw = ((localMetricsRaw.Database ?? localMetricsRaw.database) ??
    {}) as Record<string, unknown>;
  const schedulerRaw = ((localMetricsRaw.Scheduler ?? localMetricsRaw.scheduler) ??
    {}) as Record<string, unknown>;
  const kpisRaw = ((localMetricsRaw.OperationalKpis ??
    localMetricsRaw.operationalKpis) ??
    {}) as Record<string, unknown>;
  const thirdPartyRaw = ((localMetricsRaw.ThirdPartyReadiness ??
    localMetricsRaw.thirdPartyReadiness) ??
    {}) as Record<string, unknown>;
  const probesRaw = (r.EnvironmentProbes ?? r.environmentProbes) as unknown;
  const heartbeatRaw = ((r.Heartbeat ?? r.heartbeat) ?? {}) as Record<string, unknown>;

  return {
    providerVerificationMode: String(
      r.ProviderVerificationMode ?? r.providerVerificationMode ?? "unknown",
    ),
    currentEnvironment: String(
      r.CurrentEnvironment ?? r.currentEnvironment ?? "unknown",
    ),
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    severity: String(r.Severity ?? r.severity ?? "ok") as ApmSeverity,
    heartbeat: {
      instanceId: String(heartbeatRaw.InstanceId ?? heartbeatRaw.instanceId ?? ""),
      startedAt: String(heartbeatRaw.StartedAt ?? heartbeatRaw.startedAt ?? ""),
      lastSeenAt: String(heartbeatRaw.LastSeenAt ?? heartbeatRaw.lastSeenAt ?? ""),
    },
    localMetrics: {
      environment: String(
        localMetricsRaw.Environment ?? localMetricsRaw.environment ?? "unknown",
      ),
      uptimeSeconds: Number(
        localMetricsRaw.UptimeSeconds ?? localMetricsRaw.uptimeSeconds ?? 0,
      ),
      severity: String(localMetricsRaw.Severity ?? localMetricsRaw.severity ?? "ok") as ApmSeverity,
      database: {
        canConnect: Boolean(databaseRaw.CanConnect ?? databaseRaw.canConnect),
        connectivityLatencyMs: Number(
          databaseRaw.ConnectivityLatencyMs ??
            databaseRaw.connectivityLatencyMs ??
            0,
        ),
        sampleQueryLatencyMs: Number(
          databaseRaw.SampleQueryLatencyMs ?? databaseRaw.sampleQueryLatencyMs ?? 0,
        ),
        severity: String(databaseRaw.Severity ?? databaseRaw.severity ?? "ok") as ApmSeverity,
      },
      scheduler: {
        storageType: String(
          schedulerRaw.StorageType ?? schedulerRaw.storageType ?? "unknown",
        ),
        recurringJobsCount: Number(
          schedulerRaw.RecurringJobsCount ?? schedulerRaw.recurringJobsCount ?? 0,
        ),
        enqueuedCount: Number(
          schedulerRaw.EnqueuedCount ?? schedulerRaw.enqueuedCount ?? 0,
        ),
        processingCount: Number(
          schedulerRaw.ProcessingCount ?? schedulerRaw.processingCount ?? 0,
        ),
        failedCount: Number(schedulerRaw.FailedCount ?? schedulerRaw.failedCount ?? 0),
        scheduledCount: Number(
          schedulerRaw.ScheduledCount ?? schedulerRaw.scheduledCount ?? 0,
        ),
        severity: String(schedulerRaw.Severity ?? schedulerRaw.severity ?? "ok") as ApmSeverity,
      },
      operationalKpis: {
        activeCampaigns: Number(kpisRaw.ActiveCampaigns ?? kpisRaw.activeCampaigns ?? 0),
        pendingCampaigns: Number(
          kpisRaw.PendingCampaigns ?? kpisRaw.pendingCampaigns ?? 0,
        ),
        completedCampaignsLast24Hours: Number(
          kpisRaw.CompletedCampaignsLast24Hours ??
            kpisRaw.completedCampaignsLast24Hours ??
            0,
        ),
        activePurchaseOrders: Number(
          kpisRaw.ActivePurchaseOrders ?? kpisRaw.activePurchaseOrders ?? 0,
        ),
        failedPurchaseOrdersLast24Hours: Number(
          kpisRaw.FailedPurchaseOrdersLast24Hours ??
            kpisRaw.failedPurchaseOrdersLast24Hours ??
            0,
        ),
        apiUsageFailuresLast24Hours: Number(
          kpisRaw.ApiUsageFailuresLast24Hours ??
            kpisRaw.apiUsageFailuresLast24Hours ??
            0,
        ),
        smsBalance: Number(kpisRaw.SmsBalance ?? kpisRaw.smsBalance ?? 0),
        emailBalance: Number(kpisRaw.EmailBalance ?? kpisRaw.emailBalance ?? 0),
        whatsAppBalance: Number(kpisRaw.WhatsAppBalance ?? kpisRaw.whatsAppBalance ?? 0),
        whatsAppUtilityBalance: Number(
          kpisRaw.WhatsAppUtilityBalance ?? kpisRaw.whatsAppUtilityBalance ?? 0,
        ),
      },
      thirdPartyReadiness: {
        sms: mapApmReadinessItem(((thirdPartyRaw.Sms ?? thirdPartyRaw.sms) ??
          {}) as Record<string, unknown>),
        whatsApp: mapApmReadinessItem(
          ((thirdPartyRaw.WhatsApp ?? thirdPartyRaw.whatsApp) ??
            {}) as Record<string, unknown>,
        ),
        email: mapApmReadinessItem(
          ((thirdPartyRaw.Email ?? thirdPartyRaw.email) ??
            {}) as Record<string, unknown>,
        ),
        payments: mapApmReadinessItem(
          ((thirdPartyRaw.Payments ?? thirdPartyRaw.payments) ??
            {}) as Record<string, unknown>,
        ),
      },
    },
    environmentProbes: Array.isArray(probesRaw)
      ? probesRaw.map((probe) => {
          const p = (probe ?? {}) as Record<string, unknown>;
          return {
            environment: String(p.Environment ?? p.environment ?? "unknown"),
            baseUrl: String(p.BaseUrl ?? p.baseUrl ?? ""),
            isReachable: Boolean(p.IsReachable ?? p.isReachable),
            statusCode: (p.StatusCode ?? p.statusCode ?? null) as number | null,
            latencyMs: Number(p.LatencyMs ?? p.latencyMs ?? 0),
            severity: String(p.Severity ?? p.severity ?? "ok") as ApmSeverity,
          };
        })
      : [],
  };
}

function mapApmChannelHealthResponse(
  r: Record<string, unknown>,
): ApmChannelHealthResponse {
  const channelsRaw = (r.Channels ?? r.channels) as unknown;
  return {
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    severity: String(r.Severity ?? r.severity ?? "ok") as ApmSeverity,
    channels: Array.isArray(channelsRaw)
      ? channelsRaw.map((item) => {
          const c = (item ?? {}) as Record<string, unknown>;
          return {
            channel: String(c.Channel ?? c.channel ?? "Unknown"),
            pendingRecipients: Number(c.PendingRecipients ?? c.pendingRecipients ?? 0),
            dispatchedLast24Hours: Number(
              c.DispatchedLast24Hours ?? c.dispatchedLast24Hours ?? 0,
            ),
            failedApiUsagesLast24Hours: Number(
              c.FailedApiUsagesLast24Hours ?? c.failedApiUsagesLast24Hours ?? 0,
            ),
            severity: String(c.Severity ?? c.severity ?? "ok") as ApmSeverity,
          };
        })
      : [],
  };
}

function mapApmLinksResponse(r: Record<string, unknown>): ApmLinksResponse {
  const mapLinks = (input: unknown): ApmLinksResponse["production"] => {
    const v = (input ?? {}) as Record<string, unknown>;
    return {
      environment: String(v.Environment ?? v.environment ?? "unknown"),
      apiBaseUrl: String(v.ApiBaseUrl ?? v.apiBaseUrl ?? ""),
      hangfireDashboardUrl: String(
        v.HangfireDashboardUrl ?? v.hangfireDashboardUrl ?? "",
      ),
      seqUrl: String(v.SeqUrl ?? v.seqUrl ?? ""),
      grafanaUrl: (v.GrafanaUrl ?? v.grafanaUrl) as string | undefined,
    };
  };

  return {
    production: mapLinks(r.Production ?? r.production),
    staging: mapLinks(r.Staging ?? r.staging),
  };
}

export function mapDispatchControlResponse(
  r: Record<string, unknown>,
): DispatchControlResponse {
  const channelsRaw = (r.Channels ?? r.channels) as unknown;
  return {
    environment: String(r.Environment ?? r.environment ?? "unknown"),
    isGloballyPaused: Boolean(r.IsGloballyPaused ?? r.isGloballyPaused ?? false),
    channels: Array.isArray(channelsRaw)
      ? channelsRaw.map((item) => {
          const c = (item ?? {}) as Record<string, unknown>;
          return {
            channel: String(c.Channel ?? c.channel ?? "unknown"),
            isPaused: Boolean(c.IsPaused ?? c.isPaused ?? false),
          };
        })
      : [],
    updatedAt: String(r.UpdatedAt ?? r.updatedAt ?? ""),
  };
}

export function mapSchedulerRecurringJobsResponse(
  r: Record<string, unknown>,
): SchedulerRecurringJobsResponse {
  const jobsRaw = (r.Jobs ?? r.jobs) as unknown;
  return {
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    jobs: Array.isArray(jobsRaw)
      ? jobsRaw.map((item) => {
          const j = (item ?? {}) as Record<string, unknown>;
          return {
            jobId: String(j.JobId ?? j.jobId ?? ""),
            cron: String(j.Cron ?? j.cron ?? ""),
            description: String(j.Description ?? j.description ?? ""),
            queue: String(j.Queue ?? j.queue ?? "default"),
            lastJobState: (j.LastJobState ?? j.lastJobState) as string | undefined,
            lastExecution: (j.LastExecution ?? j.lastExecution) as string | undefined,
            nextExecution: (j.NextExecution ?? j.nextExecution) as string | undefined,
            error: (j.Error ?? j.error) as string | undefined,
            isScheduled: Boolean(j.IsScheduled ?? j.isScheduled ?? false),
          };
        })
      : [],
  };
}

export function mapSchedulerRecurringJobActionResponse(
  r: Record<string, unknown>,
): SchedulerRecurringJobActionResponse {
  return {
    jobId: String(r.JobId ?? r.jobId ?? ""),
    action: String(r.Action ?? r.action ?? "pause") as
      | "pause"
      | "resume"
      | "cancel",
    isScheduled: Boolean(r.IsScheduled ?? r.isScheduled ?? false),
    updatedAt: String(r.UpdatedAt ?? r.updatedAt ?? ""),
  };
}

export function mapApmAlertsResponse(r: Record<string, unknown>): ApmAlertsResponse {
  const countersRaw = ((r.Counters ?? r.counters) ?? {}) as Record<string, unknown>;
  const alertsRaw = (r.Alerts ?? r.alerts) as unknown;

  return {
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    counters: {
      open: Number(countersRaw.Open ?? countersRaw.open ?? 0),
      critical: Number(countersRaw.Critical ?? countersRaw.critical ?? 0),
      high: Number(countersRaw.High ?? countersRaw.high ?? 0),
      medium: Number(countersRaw.Medium ?? countersRaw.medium ?? 0),
    },
    alerts: Array.isArray(alertsRaw)
      ? alertsRaw.map((item) => {
          const a = (item ?? {}) as Record<string, unknown>;
          return {
            alertKey: String(a.AlertKey ?? a.alertKey ?? ""),
            type: String(a.Type ?? a.type ?? "unknown"),
            severity: String(a.Severity ?? a.severity ?? "warning") as ReliabilityAlertSeverity,
            title: String(a.Title ?? a.title ?? "Alert"),
            description: String(a.Description ?? a.description ?? ""),
            channel: (a.Channel ?? a.channel) as string | undefined,
            environment: (a.Environment ?? a.environment) as string | undefined,
            observedAt: String(a.ObservedAt ?? a.observedAt ?? ""),
            acknowledged: Boolean(a.Acknowledged ?? a.acknowledged ?? false),
          };
        })
      : [],
  };
}

export function mapDashboardAnalyticsOverviewResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsOverviewResponse {
  const campaignPerformanceRaw =
    ((r.CampaignPerformance ?? r.campaignPerformance) as Record<string, unknown> | undefined) ?? {};
  const creditsFinanceRaw =
    ((r.CreditsFinance ?? r.creditsFinance) as Record<string, unknown> | undefined) ?? {};
  const audienceRaw = ((r.Audience ?? r.audience) as Record<string, unknown> | undefined) ?? {};
  const apiOpsRaw = ((r.ApiOps ?? r.apiOps) as Record<string, unknown> | undefined) ?? {};
  const appliedFiltersRaw =
    ((r.AppliedFilters ?? r.appliedFilters) as Record<string, unknown> | undefined) ?? {};

  return {
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    appliedFilters: {
      from: String(appliedFiltersRaw.From ?? appliedFiltersRaw.from ?? ""),
      to: String(appliedFiltersRaw.To ?? appliedFiltersRaw.to ?? ""),
      companyId: ((appliedFiltersRaw.CompanyId ?? appliedFiltersRaw.companyId) as number | null | undefined) ?? undefined,
      channel: ((appliedFiltersRaw.Channel ?? appliedFiltersRaw.channel) as string | null | undefined) ?? undefined,
    },
    activeCampaigns: Number(r.ActiveCampaigns ?? r.activeCampaigns ?? 0),
    totalCompanies: Number(r.TotalCompanies ?? r.totalCompanies ?? 0),
    activeClients: Number(r.ActiveClients ?? r.activeClients ?? 0),
    totalMessagesSent: Number(r.TotalMessagesSent ?? r.totalMessagesSent ?? 0),
    totalRevenue: Number(r.TotalRevenue ?? r.totalRevenue ?? 0),
    paymentSuccessRate: Number(r.PaymentSuccessRate ?? r.paymentSuccessRate ?? 0),
    campaignPerformance: mapDashboardAnalyticsCampaignPerformanceResponse(campaignPerformanceRaw),
    creditsFinance: mapDashboardAnalyticsCreditsFinanceResponse(creditsFinanceRaw),
    audience: mapDashboardAnalyticsAudienceResponse(audienceRaw),
    apiOps: mapDashboardAnalyticsApiOpsResponse(apiOpsRaw),
  };
}

export function mapDashboardAnalyticsOverviewComparisonResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsOverviewComparisonResponse {
  const currentRaw =
    ((r.Current ?? r.current) as Record<string, unknown> | undefined) ?? {};
  const previousRaw =
    ((r.Previous ?? r.previous) as Record<string, unknown> | undefined) ?? {};

  return {
    current: mapDashboardAnalyticsOverviewResponse(currentRaw),
    previous: mapDashboardAnalyticsOverviewResponse(previousRaw),
  };
}

export function mapDashboardAnalyticsTrendsResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsTrendsResponse {
  const pointsRaw = (r.Points ?? r.points) as unknown;
  return {
    bucket: String(r.Bucket ?? r.bucket ?? "day") === "week" ? "week" : "day",
    points: Array.isArray(pointsRaw)
      ? pointsRaw.map((item) => {
          const p = (item ?? {}) as Record<string, unknown>;
          return {
            bucketStart: String(p.BucketStart ?? p.bucketStart ?? ""),
            campaigns: Number(p.Campaigns ?? p.campaigns ?? 0),
            approvedCampaigns: Number(p.ApprovedCampaigns ?? p.approvedCampaigns ?? 0),
            activeCampaigns: Number(p.ActiveCampaigns ?? p.activeCampaigns ?? 0),
            purchaseOrders: Number(p.PurchaseOrders ?? p.purchaseOrders ?? 0),
            transactions: Number(p.Transactions ?? p.transactions ?? 0),
          };
        })
      : [],
  };
}

function mapDashboardAnalyticsFunnelResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsFunnelResponse {
  return {
    created: Number(r.Created ?? r.created ?? 0),
    approved: Number(r.Approved ?? r.approved ?? 0),
    activated: Number(r.Activated ?? r.activated ?? 0),
    completed: Number(r.Completed ?? r.completed ?? 0),
    completionRate: Number(r.CompletionRate ?? r.completionRate ?? 0),
  };
}

function mapDashboardAnalyticsModerationResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsModerationResponse {
  return {
    pendingApprovals: Number(r.PendingApprovals ?? r.pendingApprovals ?? 0),
    approvedCount: Number(r.ApprovedCount ?? r.approvedCount ?? 0),
    rejectedCount: Number(r.RejectedCount ?? r.rejectedCount ?? 0),
    approvalRate: Number(r.ApprovalRate ?? r.approvalRate ?? 0),
    medianReviewHours: Number(r.MedianReviewHours ?? r.medianReviewHours ?? 0),
  };
}

export function mapDashboardAnalyticsRetentionResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsRetentionResponse {
  const cohortsRaw = (r.Cohorts ?? r.cohorts) as unknown;
  return {
    cohorts: Array.isArray(cohortsRaw)
      ? cohortsRaw.map((item) => {
          const cohort = (item ?? {}) as Record<string, unknown>;
          const pointsRaw = (cohort.RetentionPoints ?? cohort.retentionPoints) as unknown;
          return {
            cohortMonth: String(cohort.CohortMonth ?? cohort.cohortMonth ?? ""),
            cohortSize: Number(cohort.CohortSize ?? cohort.cohortSize ?? 0),
            retentionPoints: Array.isArray(pointsRaw)
              ? pointsRaw.map((point) => {
                  const p = (point ?? {}) as Record<string, unknown>;
                  return {
                    monthIndex: Number(p.MonthIndex ?? p.monthIndex ?? 0),
                    retentionRate: Number(p.RetentionRate ?? p.retentionRate ?? 0),
                    activeUsers: Number(p.ActiveUsers ?? p.activeUsers ?? 0),
                  };
                })
              : [],
          };
        })
      : [],
  };
}

export function mapDashboardAnalyticsForecastResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsForecastResponse {
  const pointsRaw = (r.Points ?? r.points) as unknown;
  return {
    bucket: String(r.Bucket ?? r.bucket ?? "day") === "week" ? "week" : "day",
    points: Array.isArray(pointsRaw)
      ? pointsRaw.map((item) => {
          const p = (item ?? {}) as Record<string, unknown>;
          return {
            bucketStart: String(p.BucketStart ?? p.bucketStart ?? ""),
            actualValue: Number(p.ActualValue ?? p.actualValue ?? 0),
            predictedValue: Number(p.PredictedValue ?? p.predictedValue ?? 0),
            lowerBound: Number(p.LowerBound ?? p.lowerBound ?? 0),
            upperBound: Number(p.UpperBound ?? p.upperBound ?? 0),
          };
        })
      : [],
  };
}

export function mapDashboardAnalyticsAnomaliesResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsAnomaliesResponse {
  const alertsRaw = (r.Alerts ?? r.alerts) as unknown;
  return {
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    alerts: Array.isArray(alertsRaw)
      ? alertsRaw.map((item) => {
          const alert = (item ?? {}) as Record<string, unknown>;
          const severity = String(alert.Severity ?? alert.severity ?? "low");
          return {
            alertId: String(alert.AlertId ?? alert.alertId ?? ""),
            metric: String(alert.Metric ?? alert.metric ?? ""),
            severity: (severity === "critical" ||
            severity === "high" ||
            severity === "medium"
              ? severity
              : "low") as BiAnomalySeverity,
            expectedValue: Number(alert.ExpectedValue ?? alert.expectedValue ?? 0),
            actualValue: Number(alert.ActualValue ?? alert.actualValue ?? 0),
            deviationPercent: Number(
              alert.DeviationPercent ?? alert.deviationPercent ?? 0,
            ),
            observedAt: String(alert.ObservedAt ?? alert.observedAt ?? ""),
          };
        })
      : [],
  };
}

function mapDashboardAnalyticsDrilldownResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsDrilldownResponse {
  const rowsRaw = (r.Rows ?? r.rows) as unknown;
  return {
    rows: Array.isArray(rowsRaw)
      ? rowsRaw.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            bucketStart: String(row.BucketStart ?? row.bucketStart ?? ""),
            companyId: ((row.CompanyId ?? row.companyId) as number | null | undefined) ?? undefined,
            companyName: ((row.CompanyName ?? row.companyName) as string | null | undefined) ?? undefined,
            channel: ((row.Channel ?? row.channel) as string | null | undefined) ?? undefined,
            revenue: Number(row.Revenue ?? row.revenue ?? 0),
            messagesSent: Number(row.MessagesSent ?? row.messagesSent ?? 0),
            conversions: Number(row.Conversions ?? row.conversions ?? 0),
            conversionRate: Number(row.ConversionRate ?? row.conversionRate ?? 0),
            failureRate: Number(row.FailureRate ?? row.failureRate ?? 0),
          };
        })
      : [],
  };
}

function mapDashboardAnalyticsBreakdownPoints(
  input: unknown,
): DashboardAnalyticsBreakdownPoint[] {
  return Array.isArray(input)
    ? input.map((item) => {
        const p = (item ?? {}) as Record<string, unknown>;
        return {
          label: String(p.Label ?? p.label ?? ""),
          value: Number(p.Value ?? p.value ?? 0),
        };
      })
    : [];
}

function mapDashboardAnalyticsCampaignPerformanceResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsCampaignPerformanceResponse {
  const byChannelRaw = (r.ByChannel ?? r.byChannel) as unknown;
  return {
    totalCampaigns: Number(r.TotalCampaigns ?? r.totalCampaigns ?? 0),
    completedCampaigns: Number(r.CompletedCampaigns ?? r.completedCampaigns ?? 0),
    completionRate: Number(r.CompletionRate ?? r.completionRate ?? 0),
    totalRecipients: Number(r.TotalRecipients ?? r.totalRecipients ?? 0),
    dispatchedRecipients: Number(r.DispatchedRecipients ?? r.dispatchedRecipients ?? 0),
    dispatchRate: Number(r.DispatchRate ?? r.dispatchRate ?? 0),
    averageTimeToCompleteHours: Number(
      r.AverageTimeToCompleteHours ?? r.averageTimeToCompleteHours ?? 0,
    ),
    byChannel: Array.isArray(byChannelRaw)
      ? byChannelRaw.map((item) => {
          const c = (item ?? {}) as Record<string, unknown>;
          return {
            channel: String(c.Channel ?? c.channel ?? ""),
            campaigns: Number(c.Campaigns ?? c.campaigns ?? 0),
            completedCampaigns: Number(c.CompletedCampaigns ?? c.completedCampaigns ?? 0),
            completionRate: Number(c.CompletionRate ?? c.completionRate ?? 0),
            totalRecipients: Number(c.TotalRecipients ?? c.totalRecipients ?? 0),
            dispatchedRecipients: Number(c.DispatchedRecipients ?? c.dispatchedRecipients ?? 0),
            dispatchRate: Number(c.DispatchRate ?? c.dispatchRate ?? 0),
          };
        })
      : [],
  };
}

function mapDashboardAnalyticsCreditsFinanceResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsCreditsFinanceResponse {
  const balancesRaw = ((r.Balances ?? r.balances) as Record<string, unknown> | undefined) ?? {};
  const purchaseOrdersRaw =
    ((r.PurchaseOrders ?? r.purchaseOrders) as Record<string, unknown> | undefined) ?? {};

  return {
    balances: {
      sms: Number(balancesRaw.Sms ?? balancesRaw.sms ?? 0),
      email: Number(balancesRaw.Email ?? balancesRaw.email ?? 0),
      whatsApp: Number(balancesRaw.WhatsApp ?? balancesRaw.whatsApp ?? 0),
      whatsAppUtility: Number(
        balancesRaw.WhatsAppUtility ?? balancesRaw.whatsAppUtility ?? 0,
      ),
    },
    purchaseOrders: {
      pending: Number(purchaseOrdersRaw.Pending ?? purchaseOrdersRaw.pending ?? 0),
      active: Number(purchaseOrdersRaw.Active ?? purchaseOrdersRaw.active ?? 0),
      failed: Number(purchaseOrdersRaw.Failed ?? purchaseOrdersRaw.failed ?? 0),
      depleted: Number(purchaseOrdersRaw.Depleted ?? purchaseOrdersRaw.depleted ?? 0),
      expired: Number(purchaseOrdersRaw.Expired ?? purchaseOrdersRaw.expired ?? 0),
    },
    totalRevenue: Number(r.TotalRevenue ?? r.totalRevenue ?? 0),
    paymentSuccessRate: Number(r.PaymentSuccessRate ?? r.paymentSuccessRate ?? 0),
  };
}

function mapDashboardAnalyticsAudienceResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsAudienceResponse {
  return {
    totalSubscribers: Number(r.TotalSubscribers ?? r.totalSubscribers ?? 0),
    newSubscribers: Number(r.NewSubscribers ?? r.newSubscribers ?? 0),
    activeSubscribers: Number(r.ActiveSubscribers ?? r.activeSubscribers ?? 0),
    optInSms: Number(r.OptInSms ?? r.optInSms ?? 0),
    optInEmail: Number(r.OptInEmail ?? r.optInEmail ?? 0),
    optInWhatsApp: Number(r.OptInWhatsApp ?? r.optInWhatsApp ?? 0),
    bySubscriptionSource: mapDashboardAnalyticsBreakdownPoints(
      r.BySubscriptionSource ?? r.bySubscriptionSource,
    ),
    byProvince: mapDashboardAnalyticsBreakdownPoints(r.ByProvince ?? r.byProvince),
  };
}

function mapDashboardAnalyticsApiOpsResponse(
  r: Record<string, unknown>,
): DashboardAnalyticsApiOpsResponse {
  const apiUsageRaw = ((r.ApiUsage ?? r.apiUsage) as Record<string, unknown> | undefined) ?? {};
  const channelOperationsRaw =
    ((r.ChannelOperations ?? r.channelOperations) as Record<string, unknown> | undefined) ?? {};

  return {
    apiUsage: {
      total: Number(apiUsageRaw.Total ?? apiUsageRaw.total ?? 0),
      successCount: Number(apiUsageRaw.SuccessCount ?? apiUsageRaw.successCount ?? 0),
      failureCount: Number(apiUsageRaw.FailureCount ?? apiUsageRaw.failureCount ?? 0),
      successRate: Number(apiUsageRaw.SuccessRate ?? apiUsageRaw.successRate ?? 0),
      byChannel: mapDashboardAnalyticsBreakdownPoints(
        apiUsageRaw.ByChannel ?? apiUsageRaw.byChannel,
      ),
    },
    channelOperations: {
      pendingRecipients: Number(
        channelOperationsRaw.PendingRecipients ?? channelOperationsRaw.pendingRecipients ?? 0,
      ),
      dispatchedLast24Hours: Number(
        channelOperationsRaw.DispatchedLast24Hours ??
          channelOperationsRaw.dispatchedLast24Hours ??
          0,
      ),
      failedApiUsagesLast24Hours: Number(
        channelOperationsRaw.FailedApiUsagesLast24Hours ??
          channelOperationsRaw.failedApiUsagesLast24Hours ??
          0,
      ),
    },
  };
}

export function buildReliabilityNotificationPayload(alert: {
  alertKey: string;
  severity: ReliabilityAlertSeverity;
  title: string;
  description: string;
  environment?: string;
  channel?: string;
  observedAt?: string;
}): ReliabilityNotificationPayload {
  const envSegment = alert.environment ? ` (${alert.environment})` : "";
  const channelSegment = alert.channel ? ` [${alert.channel}]` : "";
  return {
    title: alert.title,
    message: `${alert.description}${envSegment}${channelSegment}`.trim(),
    type: "reliability_alert",
    link: "/admin/apm",
    dedupeKey: `reliability:${alert.alertKey}`,
    severity: alert.severity,
    metadata: {
      alertKey: alert.alertKey,
      observedAt: alert.observedAt ?? "",
      environment: alert.environment ?? null,
      channel: alert.channel ?? null,
    },
  };
}

async function request<T>(
  path: string,
  options: RequestInit & { authToken?: string; baseUrlOverride?: string } = {},
): Promise<T> {
  const isClient = typeof window !== "undefined";
  const pathNormalized = path.replace(/^\/+/, "");

  let url: string;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" &&
    options.headers !== null &&
    !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  if (isClient) {
    url = `/api/admin/proxy/${pathNormalized}`;
    headers["X-Api-Base"] = (
      options.baseUrlOverride || getApiBaseUrl()
    ).replace(/\/+$/, "");
  } else {
    url = `${(options.baseUrlOverride || getApiBaseUrl()).replace(/\/+$/, "")}/${pathNormalized}`;
    if (options.authToken) {
      headers["Authorization"] = `Bearer ${options.authToken}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const d =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;
    const message =
      (d &&
        (typeof d.message === "string"
          ? d.message
          : typeof d.detail === "string"
            ? d.detail
            : typeof d.title === "string"
              ? d.title
              : null)) ||
      "Request failed";

    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}

function shouldFallbackApmToProd(err: unknown): boolean {
  if (getApiBaseUrl().replace(/\/+$/, "") !== DEV_API_BASE.replace(/\/+$/, "")) {
    return false;
  }
  if (!(err instanceof Error)) return false;
  return (err as Error & { status?: number }).status === 404;
}

export const adminApi = {
  login: (username: string, password: string) =>
    request<AuthResponse>("v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getCompanies: (params?: {
    id?: number;
    industry?: string;
    isCompanyVerified?: boolean;
    query?: string;
    includeDeactivated?: boolean;
    authToken?: string;
  }) => {
    const { authToken, ...filters } = params || {};
    const search = new URLSearchParams();
    if (filters.id != null) search.set("Id", String(filters.id));
    if (filters.industry) search.set("Industry", filters.industry);
    if (filters.isCompanyVerified != null)
      search.set("IsCompanyVerified", String(filters.isCompanyVerified));
    if (filters.query) search.set("Query", filters.query);
    if (filters.includeDeactivated != null)
      search.set("IncludeDeactivated", String(filters.includeDeactivated));

    const qs = search.toString();
    const path = qs ? `${BACKOFFICE}/companies?${qs}` : `${BACKOFFICE}/companies`;

    return request<Record<string, unknown>[]>(path, { authToken }).then(
      (list) => list.map((r) => mapCompanyLeanResponse(r)),
    );
  },

  getCompanyById: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies/${id}`, {
      authToken,
    }).then(mapCompanyLeanResponse),

  createCompany: (payload: Record<string, unknown>, authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }).then(mapCompanyLeanResponse),

  updateCompany: (
    id: number,
    payload: Record<string, unknown>,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      authToken,
    }).then(mapCompanyLeanResponse),

  deleteCompany: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/companies/${id}`, {
      method: "DELETE",
      authToken,
    }),

  deactivateCompany: (id: number, reason?: string, authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies/${id}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
      authToken,
    }).then(mapCompanyLeanResponse),

  purgeCompany: (id: number, _reason?: string, authToken?: string) =>
    request<void>(`${BACKOFFICE}/companies/${id}`, {
      method: "DELETE",
      authToken,
    }),

  verifyCompany: (id: number, verify: boolean, authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${id}/verify?verify=${verify}`,
      { method: "PATCH", authToken },
    ).then(mapCompanyLeanResponse),

  reviewCompany: (
    id: number,
    payload: { status: CompanyReviewStatus; reason?: string },
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      authToken,
    }).then(mapCompanyLeanResponse),

  approveCompanySenderId: (
    companyId: number,
    approve: boolean,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/approve-sender-id?approve=${approve}`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapCompanyLeanResponse),

  approveCompanyNetworkSenderId: (
    companyId: number,
    network: "Mtn" | "Airtel" | "Zamtel" | "Zedmobile",
    approve: boolean,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/approve-network-sender-id`,
      {
        method: "PATCH",
        body: JSON.stringify({ network, approve }),
        authToken,
      },
    ).then(mapCompanyLeanResponse),

  /** Submits sender ID registration to mobile network operators (MNOs). Backend: POST …/companies/{id}/submit-to-mnos */
  submitCompanyToMnos: (
    companyId: number,
    payload: SubmitCompanyToMnosPayload,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/submit-to-mnos`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        authToken,
      },
    ).then(mapCompanyLeanResponse),

  getCompanyMnoSubmissions: (companyId: number, authToken?: string) =>
    request<Record<string, unknown>[]>(
      `${BACKOFFICE}/companies/${companyId}/mno-submissions`,
      { authToken },
    ).then((list) => list.map(mapCompanyMnoSubmissionHistoryItem)),

  updateCompanySenderId: (
    companyId: number,
    senderId: string,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/sender-id`,
      {
        method: "PATCH",
        body: JSON.stringify({ senderId }),
        authToken,
      },
    ).then(mapCompanyLeanResponse),

  updateCompanyCampaignApprovalOverride: (
    companyId: number,
    payload: CompanyCampaignApprovalOverrideRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaign-approval-override`,
      {
        method: "PATCH",
        body: JSON.stringify({
          requireCampaignApprovalOverride:
            payload.requireCampaignApprovalOverride ?? null,
        }),
        authToken,
      },
    ).then(mapCompanyLeanResponse),

  getCompanyWhatsAppCredentials: (
    companyId: number,
    isTestKey: boolean = false,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/whatsapp-credentials?isTestKey=${isTestKey}`,
      { authToken },
    ).then(mapCompanyWhatsAppCredentialMasked),

  upsertCompanyWhatsAppCredentials: (
    companyId: number,
    payload: CompanyWhatsAppCredentialUpsertRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/whatsapp-credentials`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        authToken,
      },
    ).then(mapCompanyWhatsAppCredentialMasked),

  testCompanyWhatsAppCredentials: (
    companyId: number,
    isTestKey: boolean = false,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/whatsapp-credentials/test?isTestKey=${isTestKey}`,
      { method: "POST", authToken },
    ).then((r) => ({
      ok: Boolean(r.ok ?? r.Ok),
      message: String(r.message ?? r.Message ?? ""),
    })),

  deactivateCompanyWhatsAppCredentials: (
    companyId: number,
    isTestKey: boolean = false,
    authToken?: string,
  ) =>
    request<void>(
      `${BACKOFFICE}/companies/${companyId}/whatsapp-credentials?isTestKey=${isTestKey}`,
      { method: "DELETE", authToken },
    ),

  /** Backoffice: Meta-approved templates for the company WABA (cached on server). */
  getBackofficeCompanyWhatsAppTemplateCatalog: (
    companyId: number,
    params?: {
      isTestKey?: boolean;
      category?: "marketing" | "utility" | null;
      authToken?: string;
    },
  ) => {
    const { isTestKey = false, category, authToken } = params ?? {};
    const q = new URLSearchParams({ isTestKey: String(isTestKey) });
    if (category) q.set("category", category);
    return request<Record<string, unknown>[]>(
      `${BACKOFFICE}/companies/${companyId}/whatsapp/templates?${q.toString()}`,
      { authToken },
    ).then((list) =>
      Array.isArray(list) ? list.map(mapWhatsAppTemplateCatalogItem) : [],
    );
  },

  /** Company member API: same catalog as backoffice, for client campaign UIs. */
  getCompanyWhatsAppTemplateCatalog: (
    companyId: number,
    params?: {
      useTestCredentialSlot?: boolean;
      category?: "marketing" | "utility" | null;
      authToken?: string;
    },
  ) => {
    const { useTestCredentialSlot = false, category, authToken } = params ?? {};
    const q = new URLSearchParams({
      useTestCredentialSlot: String(useTestCredentialSlot),
    });
    if (category) q.set("category", category);
    return request<Record<string, unknown>[]>(
      `v1/companies/${companyId}/whatsapp/templates?${q.toString()}`,
      { authToken },
    ).then((list) =>
      Array.isArray(list) ? list.map(mapWhatsAppTemplateCatalogItem) : [],
    );
  },

  getCompanyMembers: (companyId: number, authToken?: string) =>
    request<Record<string, unknown>[]>(
      `${BACKOFFICE}/companies/${companyId}/members`,
      { authToken },
    ).then((list) => list.map(mapCompanyMemberResponse)),

  updateCompanyMemberRole: (
    companyId: number,
    memberId: number,
    role: CompanyMemberRole,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/members/${memberId}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
        authToken,
      },
    ).then(mapCompanyMemberResponse),

  removeCompanyMember: (companyId: number, memberId: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/companies/${companyId}/members/${memberId}`, {
      method: "DELETE",
      authToken,
    }),

  createCompanyInvite: (
    companyId: number,
    payload: CreateCompanyInviteRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/companies/${companyId}/invites`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }).then((r) => ({
      id: Number(r.Id ?? r.id ?? 0),
      companyId: Number(r.CompanyId ?? r.companyId ?? 0),
      companyName: String(r.CompanyName ?? r.companyName ?? ""),
      email: String(r.Email ?? r.email ?? ""),
      role: String(r.Role ?? r.role ?? "Member") as CompanyMemberRole,
      status: String(r.Status ?? r.status ?? "Pending"),
      expiresAt: String(r.ExpiresAt ?? r.expiresAt ?? ""),
      token: String(r.Token ?? r.token ?? ""),
    })),

  approveCampaign: (
    companyId: number,
    campaignId: number,
    approve: boolean,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/approve?approve=${approve}`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapAdsCampaignResponse),

  getCompanyCampaignsAll: (
    companyId: number,
    params?: { id?: number; pageSize?: number; pageNumber?: number; query?: string },
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params?.id != null) search.set("Id", String(params.id));
    if (params?.pageSize != null)
      search.set("PageSize", String(params.pageSize));
    if (params?.pageNumber != null)
      search.set("PageNumber", String(params.pageNumber));
    if (params?.query) search.set("Query", params.query);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/companies/${companyId}/campaigns?${qs}`
      : `${BACKOFFICE}/companies/${companyId}/campaigns`;
    return request<Record<string, unknown>[]>(path, { authToken }).then(
      (list) => list.map(mapAdsCampaignResponse),
    );
  },

  getCampaignById: async (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) => {
    const list = await adminApi.getCompanyCampaignsAll(
      companyId,
      { id: campaignId, pageSize: 1, pageNumber: 1 },
      authToken,
    );
    const campaign = list.find((item) => item.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    return campaign;
  },

  createCampaignOnBehalf: (
    companyId: number,
    payload: Record<string, unknown>,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        authToken,
      },
    ).then(mapAdsCampaignResponse),

  activateCampaign: (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/activate`,
      { method: "PATCH", authToken },
    ).then(mapAdsCampaignResponse),

  cancelCampaign: (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/cancel`,
      { method: "PATCH", authToken },
    ).then(mapAdsCampaignResponse),

  retargetCampaign: (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/retarget`,
      { method: "POST", authToken },
    ).then((r) => {
      const retargetedCount = Number(r.RetargetedCount ?? r.retargetedCount ?? 0)
      const stillPendingCount = Number(
        r.StillPendingCount ?? r.stillPendingCount ?? 0,
      )
      const pendingNetworksRaw =
        (r.PendingNetworks ?? r.pendingNetworks) as unknown
      const pendingNetworks = Array.isArray(pendingNetworksRaw)
        ? (pendingNetworksRaw as unknown[]).map((x) => String(x))
        : []
      const out: RetargetResponse = {
        retargetedCount,
        stillPendingCount,
        pendingNetworks,
      }
      return out
    }),

  resendCampaign: (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/resend`,
      { method: "PATCH", authToken },
    ).then(mapAdsCampaignResponse),

  getCampaignLogs: (
    companyId: number,
    campaignId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>[]>(
      `${BACKOFFICE}/companies/${companyId}/campaigns/${campaignId}/logs`,
      { authToken },
    ).then((list) => list.map(mapCampaignLogResponse)),

  getPermissions: (authToken?: string) =>
    request<string[]>(`${BACKOFFICE}/permissions`, { authToken }),

  getRoles: (authToken?: string) =>
    request<BackofficeRoleResponse[]>(`${BACKOFFICE}/roles`, { authToken }),

  getRoleById: (id: number, authToken?: string) =>
    request<BackofficeRoleResponse>(`${BACKOFFICE}/roles/${id}`, {
      authToken,
    }),

  createRole: (
    payload: { name: string; permissions?: string[] },
    authToken?: string,
  ) =>
    request<BackofficeRoleResponse>(`${BACKOFFICE}/roles`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }),

  updateRole: (
    id: number,
    payload: { name?: string },
    authToken?: string,
  ) =>
    request<BackofficeRoleResponse>(`${BACKOFFICE}/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      authToken,
    }),

  setRolePermissions: (
    id: number,
    permissions: string[],
    authToken?: string,
  ) =>
    request<BackofficeRoleResponse>(`${BACKOFFICE}/roles/${id}/permissions`, {
      method: "PUT",
      body: JSON.stringify(permissions),
      authToken,
    }),

  deleteRole: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/roles/${id}`, {
      method: "DELETE",
      authToken,
    }),

  getUsers: (authToken?: string) =>
    request<BackofficeUserResponse[]>(`${BACKOFFICE}/users`, { authToken }),

  getUserById: (id: number, authToken?: string) =>
    request<BackofficeUserResponse>(`${BACKOFFICE}/users/${id}`, {
      authToken,
    }),

  createUser: (
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      roles?: string[];
    },
    authToken?: string,
  ) =>
    request<BackofficeUserResponse>(`${BACKOFFICE}/users`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }),

  updateUser: (
    id: number,
    payload: { firstName?: string; lastName?: string; email?: string },
    authToken?: string,
  ) =>
    request<BackofficeUserResponse>(`${BACKOFFICE}/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      authToken,
    }),

  setUserRoles: (
    id: number,
    roles: string[],
    authToken?: string,
  ) =>
    request<BackofficeUserResponse>(`${BACKOFFICE}/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify(roles),
      authToken,
    }),

  deleteUser: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/users/${id}`, {
      method: "DELETE",
      authToken,
    }),

  getMtnReviewers: (
    status?: "pending" | "approved" | "rejected",
    authToken?: string,
  ) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<MtnReviewerAccountResponse[]>(
      `${BACKOFFICE}/mtn-reviewers${query}`,
      { authToken },
    );
  },

  updateMtnReviewerStatus: (
    reviewerId: number,
    status: "approved" | "rejected",
    authToken?: string,
  ) =>
    request<MtnReviewerAccountResponse>(
      `${BACKOFFICE}/mtn-reviewers/${reviewerId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
        authToken,
      },
    ),

  deleteMtnReviewer: (reviewerId: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/mtn-reviewers/${reviewerId}`, {
      method: "DELETE",
      authToken,
    }),

  getClients: (
    companyId: number,
    params?: Record<string, string | number | undefined>,
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") search.set(k, String(v));
      });
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/companies/${companyId}/clients?${qs}`
      : `${BACKOFFICE}/companies/${companyId}/clients`;
    return request<Record<string, unknown>[]>(path, { authToken }).then(
      (list) => list.map((r) => mapAdsClientResponse(r)),
    );
  },

  createClient: (
    companyId: number,
    payload: Record<string, unknown>,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/clients`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        authToken,
      },
    ).then((r) => mapAdsClientResponse(r)),

  updateClient: (
    companyId: number,
    clientId: number,
    payload: Record<string, unknown>,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/clients/${clientId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        authToken,
      },
    ).then((r) => mapAdsClientResponse(r)),

  deleteClient: (
    companyId: number,
    clientId: number,
    authToken?: string,
  ) =>
    request<void>(
      `${BACKOFFICE}/companies/${companyId}/clients/${clientId}`,
      {
        method: "DELETE",
        authToken,
      },
    ),

  getPricingLadder: (duration: number, authToken?: string) =>
    request<Record<string, unknown>[]>(
      `${BACKOFFICE}/pricing/tier?duration=${encodeURIComponent(String(duration))}`,
      { authToken },
    )
      .then((list) => list.map(mapPricingLadderBandResponse))
      .catch(async (err) => {
        const status = (err as Error & { status?: number })?.status;
        if (status !== 404 && status !== 405) throw err;

        const legacy = await request<Record<string, unknown>[]>(`${BACKOFFICE}/pricing`, {
          authToken,
        }).then((list) => list.map(mapPricingResponse));
        return legacyPricingRowsToLadder(legacy, duration);
      }),

  replacePricingLadder: (
    payload: PricingLadderUpsertRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>[]>(`${BACKOFFICE}/pricing/tier`, {
      method: "PUT",
      body: JSON.stringify(payload),
      authToken,
    })
      .then((list) => list.map(mapPricingLadderBandResponse))
      .catch((err) => {
        const status = (err as Error & { status?: number })?.status;
        if (status === 404 || status === 405) {
          throw new Error(
            "This backend does not support pricing tier save yet. Deploy the updated backend first.",
          );
        }
        throw err;
      }),

  getAllPurchaseOrders: (
    params?: { pageNumber?: number; pageSize?: number },
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params?.pageNumber != null)
      search.set("PageNumber", String(params.pageNumber));
    if (params?.pageSize != null)
      search.set("PageSize", String(params.pageSize));
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/purchase-orders?${qs}`
      : `${BACKOFFICE}/purchase-orders`;
    return request<PurchaseOrderResponse[]>(path, { authToken });
  },

  getCompanyPurchaseOrders: (
    companyId: number,
    params?: { pageNumber?: number; pageSize?: number },
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params?.pageNumber != null)
      search.set("PageNumber", String(params.pageNumber));
    if (params?.pageSize != null)
      search.set("PageSize", String(params.pageSize));
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/companies/${companyId}/purchase-orders?${qs}`
      : `${BACKOFFICE}/companies/${companyId}/purchase-orders`;
    return request<PurchaseOrderResponse[]>(path, { authToken });
  },

  updatePurchaseOrderStatus: (
    id: number,
    status: string,
    authToken?: string,
  ) =>
    request<PurchaseOrderResponse>(
      `${BACKOFFICE}/purchase-orders/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
        authToken,
      },
    ),

  getTransactions: (
    params?: { pageNumber?: number; pageSize?: number },
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params?.pageNumber != null)
      search.set("PageNumber", String(params.pageNumber));
    if (params?.pageSize != null)
      search.set("PageSize", String(params.pageSize));
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/transactions?${qs}`
      : `${BACKOFFICE}/transactions`;
    return request<TransactionResponse[]>(path, { authToken });
  },

  getTransactionsWalletBalance: (authToken?: string) =>
    request<TransactionsWalletBalanceResponse>(
      `${BACKOFFICE}/transactions/wallet-balance`,
      { authToken },
    ),

  getTumaniBalance: (authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/sms-providers/tumani/balance`,
      { authToken },
    ).then((r) => {
      const holderId = String(
        r.HolderId ?? r.holderId ?? r.HolderID ?? r.holderID ?? "",
      )
      const balance = Number(r.Balance ?? r.balance ?? 0)
      return { holderId, balance } satisfies TumaniBalanceResponse
    }),

  getMtnWhitelistedSenderIds: (authToken?: string) =>
    request<Record<string, unknown>[]>(`${BACKOFFICE}/mtn-whitelisted-sender-ids`, {
      authToken,
    }).then((list) => list.map(mapMtnWhitelistedSenderIdResponse)),

  addMtnWhitelistedSenderId: (
    payload: MtnWhitelistedSenderIdRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/mtn-whitelisted-sender-ids`, {
      method: "POST",
      body: JSON.stringify({ SenderId: payload.senderId }),
      authToken,
    }).then(mapMtnWhitelistedSenderIdResponse),

  updateMtnWhitelistedSenderId: (
    id: number,
    payload: MtnWhitelistedSenderIdRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/mtn-whitelisted-sender-ids/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ SenderId: payload.senderId }),
      authToken,
    }).then(mapMtnWhitelistedSenderIdResponse),

  removeMtnWhitelistedSenderId: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/mtn-whitelisted-sender-ids/${id}`, {
      method: "DELETE",
      authToken,
    }),

  getSmsProviderRoutes: (authToken?: string) =>
    request<Record<string, unknown>[]>(`${BACKOFFICE}/sms-provider-routes`, {
      authToken,
    }).then((list) => list.map(mapSmsProviderRouteResponse)),

  addSmsProviderRoute: (
    payload: SmsProviderRouteRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/sms-provider-routes`, {
      method: "POST",
      body: JSON.stringify({
        ProviderKey: payload.providerKey,
        PredicateType: payload.predicateType,
        PredicateValue: payload.predicateValue,
        Priority: payload.priority,
        IsActive: payload.isActive,
      }),
      authToken,
    }).then(mapSmsProviderRouteResponse),

  updateSmsProviderRoute: (
    id: number,
    payload: SmsProviderRouteRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/sms-provider-routes/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ProviderKey: payload.providerKey,
          PredicateType: payload.predicateType,
          PredicateValue: payload.predicateValue,
          Priority: payload.priority,
          IsActive: payload.isActive,
        }),
        authToken,
      },
    ).then(mapSmsProviderRouteResponse),

  removeSmsProviderRoute: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/sms-provider-routes/${id}`, {
      method: "DELETE",
      authToken,
    }),

  getCompanyApiClients: (companyId: number, authToken?: string) =>
    request<Record<string, unknown>[]>(
      `${BACKOFFICE}/companies/${companyId}/api-clients`,
      {
        authToken,
      },
    ).then((list) => list.map(mapApiClientResponse)),

  createCompanyApiClient: (
    companyId: number,
    payload: CreateApiClientRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/api-clients`,
      {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          allowedChannels: payload.allowedChannels,
          requestsPerMinuteLimit: payload.requestsPerMinuteLimit,
          isTestKey: payload.isTestKey ?? false,
        }),
        authToken,
      },
    ).then(mapApiClientCreateResponse),

  rotateCompanyApiClientKey: (
    companyId: number,
    apiClientId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/api-clients/${apiClientId}/rotate`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapApiClientCreateResponse),

  revokeCompanyApiClient: (
    companyId: number,
    apiClientId: number,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/api-clients/${apiClientId}/revoke`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapApiClientResponse),

  allocateCompanyApiCredits: (
    companyId: number,
    payload: ManualCreditAllocationRequest,
    authToken?: string,
  ) =>
    request<PurchaseOrderResponse>(
      `${BACKOFFICE}/companies/${companyId}/api-credits/allocate`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        authToken,
      },
    ),

  getCompanyApiCreditBalance: (companyId: number, authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/api-credits/balance`,
      { authToken },
    ).then(mapApiCreditBalanceResponse),

  getCompanyApiUsage: (
    companyId: number,
    apiClientId?: number,
    authToken?: string,
  ) => {
    const qs =
      apiClientId != null
        ? `?apiClientId=${encodeURIComponent(String(apiClientId))}`
        : "";
    return request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${companyId}/api-usage${qs}`,
      { authToken },
    ).then(mapApiUsageSummary);
  },

  getApmOverview: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/overview`,
        { authToken },
      );
      return mapApmOverviewResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/overview`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapApmOverviewResponse(fallback);
    }
  },

  getApmChannels: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/channels`,
        { authToken },
      );
      return mapApmChannelHealthResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/channels`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapApmChannelHealthResponse(fallback);
    }
  },

  getApmLinks: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/links`,
        { authToken },
      );
      return mapApmLinksResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/links`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapApmLinksResponse(fallback);
    }
  },

  getDispatchControls: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/dispatch-controls`,
        { authToken },
      );
      return mapDispatchControlResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/dispatch-controls`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapDispatchControlResponse(fallback);
    }
  },

  getPlatformSettings: async (authToken?: string) => {
    const result = await request<Record<string, unknown>>(
      `${BACKOFFICE}/platform-settings`,
      { authToken },
    );
    return {
      id: (result.Id ?? result.id) as number | undefined,
      requireCampaignApproval: Boolean(
        (result.RequireCampaignApproval ?? result.requireCampaignApproval) ?? true,
      ),
      requireSenderIdApproval: Boolean(
        (result.RequireSenderIdApproval ?? result.requireSenderIdApproval) ?? true,
      ),
      mnoSenderIdRequestReplyToEmailPrimary: String(
        (result.MnoSenderIdRequestReplyToEmailPrimary ?? result.mnoSenderIdRequestReplyToEmailPrimary) ??
          "george.m@balloinnovations.com",
      ),
      mnoSenderIdRequestReplyToEmailSecondary: String(
        (result.MnoSenderIdRequestReplyToEmailSecondary ?? result.mnoSenderIdRequestReplyToEmailSecondary) ??
          "lombe.lusale@balloinnovations.com",
      ),
    } satisfies PlatformSettingsResponse;
  },

  updatePlatformSettings: async (
    payload: PlatformSettingsUpdateRequest,
    authToken?: string,
  ) => {
    const result = await request<Record<string, unknown>>(
      `${BACKOFFICE}/platform-settings`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        authToken,
      },
    );
    return {
      id: (result.Id ?? result.id) as number | undefined,
      requireCampaignApproval: Boolean(
        (result.RequireCampaignApproval ?? result.requireCampaignApproval) ?? true,
      ),
      requireSenderIdApproval: Boolean(
        (result.RequireSenderIdApproval ?? result.requireSenderIdApproval) ?? true,
      ),
      mnoSenderIdRequestReplyToEmailPrimary: String(
        (result.MnoSenderIdRequestReplyToEmailPrimary ?? result.mnoSenderIdRequestReplyToEmailPrimary) ??
          "george.m@balloinnovations.com",
      ),
      mnoSenderIdRequestReplyToEmailSecondary: String(
        (result.MnoSenderIdRequestReplyToEmailSecondary ?? result.mnoSenderIdRequestReplyToEmailSecondary) ??
          "lombe.lusale@balloinnovations.com",
      ),
    } satisfies PlatformSettingsResponse;
  },

  setGlobalDispatchPause: (
    environment: string,
    isPaused: boolean,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/dispatch-controls/global`, {
      method: "PATCH",
      body: JSON.stringify({ environment, isPaused }),
      authToken,
    }).then(mapDispatchControlResponse),

  setChannelDispatchPause: (
    environment: string,
    channel: string,
    isPaused: boolean,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/dispatch-controls/channel`, {
      method: "PATCH",
      body: JSON.stringify({ environment, channel, isPaused }),
      authToken,
    }).then(mapDispatchControlResponse),

  getSchedulerRecurringJobs: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/scheduler/recurring-jobs`,
        { authToken },
      );
      return mapSchedulerRecurringJobsResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/scheduler/recurring-jobs`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapSchedulerRecurringJobsResponse(fallback);
    }
  },

  pauseSchedulerRecurringJob: (
    jobId: string,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/scheduler/recurring-jobs/${encodeURIComponent(jobId)}/pause`,
      {
        method: "POST",
        authToken,
      },
    ).then(mapSchedulerRecurringJobActionResponse),

  resumeSchedulerRecurringJob: (
    jobId: string,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/scheduler/recurring-jobs/${encodeURIComponent(jobId)}/resume`,
      {
        method: "POST",
        authToken,
      },
    ).then(mapSchedulerRecurringJobActionResponse),

  cancelSchedulerRecurringJob: (
    jobId: string,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/scheduler/recurring-jobs/${encodeURIComponent(jobId)}/cancel`,
      {
        method: "POST",
        authToken,
      },
    ).then(mapSchedulerRecurringJobActionResponse),

  getApmAlerts: async (authToken?: string) => {
    try {
      const result = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/alerts`,
        { authToken },
      );
      return mapApmAlertsResponse(result);
    } catch (err) {
      if (!shouldFallbackApmToProd(err)) throw err;
      const fallback = await request<Record<string, unknown>>(
        `${BACKOFFICE}/apm/alerts`,
        { authToken, baseUrlOverride: PROD_API_BASE },
      );
      return mapApmAlertsResponse(fallback);
    }
  },

  getDashboardAnalyticsOverview: (
    params: {
      from?: string;
      to?: string;
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/overview?${qs}`
      : `${BACKOFFICE}/analytics/overview`;
    return request<Record<string, unknown>>(path, { authToken }).then(
      mapDashboardAnalyticsOverviewResponse,
    );
  },

  getDashboardAnalyticsOverviewComparison: (
    params: {
      from?: string;
      to?: string;
      previousFrom?: string;
      previousTo?: string;
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.previousFrom) search.set("previousFrom", params.previousFrom);
    if (params.previousTo) search.set("previousTo", params.previousTo);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/overview-comparison?${qs}`
      : `${BACKOFFICE}/analytics/overview-comparison`;
    return request<Record<string, unknown>>(path, { authToken }).then(
      mapDashboardAnalyticsOverviewComparisonResponse,
    );
  },

  getDashboardAnalyticsTrends: (
    params: {
      from?: string;
      to?: string;
      bucket?: "day" | "week";
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.bucket) search.set("bucket", params.bucket);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/trends?${qs}`
      : `${BACKOFFICE}/analytics/trends`;
    return request<Record<string, unknown>>(path, { authToken }).then(
      mapDashboardAnalyticsTrendsResponse,
    );
  },

  getDashboardAnalyticsFunnel: (
    params: {
      from?: string;
      to?: string;
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/funnel?${qs}`
      : `${BACKOFFICE}/analytics/funnel`;
    return request<Record<string, unknown>>(path, { authToken }).then(
      mapDashboardAnalyticsFunnelResponse,
    );
  },

  getDashboardAnalyticsModeration: (
    params: {
      from?: string;
      to?: string;
      companyId?: number;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/moderation?${qs}`
      : `${BACKOFFICE}/analytics/moderation`;
    return request<Record<string, unknown>>(path, { authToken }).then(
      mapDashboardAnalyticsModerationResponse,
    );
  },

  getDashboardAnalyticsRetention: (
    params: {
      from?: string;
      to?: string;
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/retention?${qs}`
      : `${BACKOFFICE}/analytics/retention`;
    return request<Record<string, unknown>>(path, { authToken })
      .then(mapDashboardAnalyticsRetentionResponse)
      .catch(async (err) => {
        if (!shouldFallbackApmToProd(err)) throw err;
        const fallback = await request<Record<string, unknown>>(path, {
          authToken,
          baseUrlOverride: PROD_API_BASE,
        });
        return mapDashboardAnalyticsRetentionResponse(fallback);
      });
  },

  getDashboardAnalyticsForecast: (
    params: {
      from?: string;
      to?: string;
      bucket?: "day" | "week";
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.bucket) search.set("bucket", params.bucket);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/forecast?${qs}`
      : `${BACKOFFICE}/analytics/forecast`;
    return request<Record<string, unknown>>(path, { authToken })
      .then(mapDashboardAnalyticsForecastResponse)
      .catch(async (err) => {
        if (!shouldFallbackApmToProd(err)) throw err;
        const fallback = await request<Record<string, unknown>>(path, {
          authToken,
          baseUrlOverride: PROD_API_BASE,
        });
        return mapDashboardAnalyticsForecastResponse(fallback);
      });
  },

  getDashboardAnalyticsAnomalies: (
    params: {
      from?: string;
      to?: string;
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/anomalies?${qs}`
      : `${BACKOFFICE}/analytics/anomalies`;
    return request<Record<string, unknown>>(path, { authToken })
      .then(mapDashboardAnalyticsAnomaliesResponse)
      .catch(async (err) => {
        if (!shouldFallbackApmToProd(err)) throw err;
        const fallback = await request<Record<string, unknown>>(path, {
          authToken,
          baseUrlOverride: PROD_API_BASE,
        });
        return mapDashboardAnalyticsAnomaliesResponse(fallback);
      });
  },

  getDashboardAnalyticsDrilldown: (
    params: {
      from?: string;
      to?: string;
      bucket?: "day" | "week";
      companyId?: number;
      channel?: string;
    } = {},
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.bucket) search.set("bucket", params.bucket);
    if (params.companyId != null) search.set("companyId", String(params.companyId));
    if (params.channel) search.set("channel", params.channel);
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/analytics/drilldown?${qs}`
      : `${BACKOFFICE}/analytics/drilldown`;
    return request<Record<string, unknown>>(path, { authToken })
      .then(mapDashboardAnalyticsDrilldownResponse)
      .catch(async (err) => {
        if (!shouldFallbackApmToProd(err)) throw err;
        const fallback = await request<Record<string, unknown>>(path, {
          authToken,
          baseUrlOverride: PROD_API_BASE,
        });
        return mapDashboardAnalyticsDrilldownResponse(fallback);
      });
  },

  getRoadmap: (authToken?: string) =>
    request<RoadmapOverviewResponse>(`${BACKOFFICE}/roadmap`, { authToken }),

  getRoadmapPhase: (phaseId: number, authToken?: string) =>
    request<RoadmapPhaseResponse>(`${BACKOFFICE}/roadmap/phases/${phaseId}`, {
      authToken,
    }),

  createRoadmapPhase: (payload: RoadmapPhaseRequest, authToken?: string) =>
    request<RoadmapPhaseResponse>(`${BACKOFFICE}/roadmap/phases`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }),

  updateRoadmapPhase: (
    id: number,
    payload: RoadmapPhaseRequest,
    authToken?: string,
  ) =>
    request<RoadmapPhaseResponse>(`${BACKOFFICE}/roadmap/phases/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      authToken,
    }),

  deleteRoadmapPhase: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/roadmap/phases/${id}`, {
      method: "DELETE",
      authToken,
    }),

  createRoadmapFeature: (
    phaseId: number,
    payload: RoadmapFeatureRequest,
    authToken?: string,
  ) =>
    request<RoadmapFeatureResponse>(
      `${BACKOFFICE}/roadmap/phases/${phaseId}/features`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        authToken,
      },
    ),

  updateRoadmapFeature: (
    id: number,
    payload: Partial<RoadmapFeatureRequest>,
    authToken?: string,
  ) =>
    request<RoadmapFeatureResponse>(`${BACKOFFICE}/roadmap/features/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      authToken,
    }),

  updateRoadmapFeatureStatus: (
    id: number,
    status: RoadmapFeatureStatus,
    statusNotes?: string,
    authToken?: string,
  ) =>
    request<RoadmapFeatureResponse>(`${BACKOFFICE}/roadmap/features/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, statusNotes }),
      authToken,
    }),

  deleteRoadmapFeature: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/roadmap/features/${id}`, {
      method: "DELETE",
      authToken,
    }),

  reorderRoadmapFeatures: (
    items: { id: number; displayOrder: number }[],
    authToken?: string,
  ) =>
    request<RoadmapFeatureResponse[]>(`${BACKOFFICE}/roadmap/features/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
      authToken,
    }),

  createRoadmapMilestone: (
    payload: RoadmapMilestoneRequest,
    authToken?: string,
  ) =>
    request<RoadmapMilestoneResponse>(`${BACKOFFICE}/roadmap/milestones`, {
      method: "POST",
      body: JSON.stringify(payload),
      authToken,
    }),

  updateRoadmapMilestone: (
    id: number,
    payload: RoadmapMilestoneRequest,
    authToken?: string,
  ) =>
    request<RoadmapMilestoneResponse>(`${BACKOFFICE}/roadmap/milestones/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      authToken,
    }),

  deleteRoadmapMilestone: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/roadmap/milestones/${id}`, {
      method: "DELETE",
      authToken,
    }),

  seedRoadmap: (authToken?: string) =>
    request<RoadmapOverviewResponse>(`${BACKOFFICE}/roadmap/seed`, {
      method: "POST",
      authToken,
    }),
};
