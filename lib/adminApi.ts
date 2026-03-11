/** Dev = local or dev server; Prod = production API. Backoffice uses Backoffice/* on both. */
export const DEV_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEV_API_URL
    ? process.env.NEXT_PUBLIC_DEV_API_URL
    : "http://localhost:5238";
export const PROD_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_PROD_API_URL
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : "https://api.balloads.com";

const BACKOFFICE = "Backoffice";

let currentBaseUrl =
  typeof window !== "undefined"
    ? (() => {
        const stored = localStorage.getItem("ballo-ads-api-env");
        return stored === "prod" ? PROD_API_BASE : DEV_API_BASE;
      })()
    : DEV_API_BASE;

/** When set by ApiEnvProvider, requests use this to get the current base URL from React state (avoids stale module variable when switching dev/prod). */
let baseUrlGetter: (() => string) | null = null;

export function registerBaseUrlGetter(getter: () => string): void {
  baseUrlGetter = getter;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && baseUrlGetter) {
    return baseUrlGetter().replace(/\/+$/, "");
  }
  return currentBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  currentBaseUrl = url.replace(/\/+$/, "");
}

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
};

export type ApmOverviewResponse = {
  providerVerificationMode: string;
  currentEnvironment: string;
  generatedAt: string;
  localMetrics: {
    environment: string;
    uptimeSeconds: number;
    database: {
      canConnect: boolean;
      connectivityLatencyMs: number;
      sampleQueryLatencyMs: number;
    };
    scheduler: {
      storageType: string;
      recurringJobsCount: number;
      enqueuedCount: number;
      processingCount: number;
      failedCount: number;
      scheduledCount: number;
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
  }>;
};

export type ApmChannelHealthResponse = {
  generatedAt: string;
  channels: Array<{
    channel: string;
    pendingRecipients: number;
    dispatchedLast24Hours: number;
    failedApiUsagesLast24Hours: number;
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
  isApprovedSenderId: boolean;
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
};

export type CampaignLogResponse = {
  id: number;
  campaignId: number;
  actorFirstName?: string;
  actorLastName?: string;
  initialStatus?: string;
  finalStatus?: string;
};

export type PricingModelResponse = {
  id: number;
  platform: string;
  thresholdStart: number;
  thresholdEnd: number;
  amountPerMessage: number;
  duration: number;
  isEnabled: boolean;
  createdAt: string;
};

export type PricingModelRequest = {
  platform: string;
  thresholdStart: number;
  thresholdEnd: number;
  amountPerMessage: number;
  duration: number;
};

export type EditPricingModelRequest = Partial<{
  thresholdStart: number;
  thresholdEnd: number;
  amountPerMessage: number;
  duration: number;
}>;

export type MtnWhitelistedSenderIdResponse = {
  id: number;
  senderId: string;
  createdAt: string;
};

export type MtnWhitelistedSenderIdRequest = {
  senderId: string;
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
    isApprovedSenderId: (r.IsApprovedSenderId ??
      r.isApprovedSenderId) as boolean,
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

/** PATCH /pricing/{id}/update expects camelCase body per Swagger EditPricingModelRequest. */
function editPricingRequestToBody(
  p: EditPricingModelRequest,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.thresholdStart !== undefined) out.thresholdStart = p.thresholdStart;
  if (p.thresholdEnd !== undefined) out.thresholdEnd = p.thresholdEnd;
  if (p.amountPerMessage !== undefined)
    out.amountPerMessage = p.amountPerMessage;
  if (p.duration !== undefined) out.duration = p.duration;
  return out;
}

/** Normalize pricing response from backend (PascalCase) to camelCase for the app */
function mapPricingResponse(r: Record<string, unknown>): PricingModelResponse {
  return {
    id: (r.Id ?? r.id) as number,
    platform: (r.Platform ?? r.platform) as string,
    thresholdStart: (r.ThresholdStart ?? r.thresholdStart) as number,
    thresholdEnd: (r.ThresholdEnd ?? r.thresholdEnd) as number,
    amountPerMessage: (r.AmountPerMessage ?? r.amountPerMessage) as number,
    duration: (r.Duration ?? r.duration) as number,
    isEnabled: (r.IsEnabled ?? r.isEnabled) as boolean,
    createdAt: (r.CreatedAt ?? r.createdAt) as string,
  };
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

  return {
    providerVerificationMode: String(
      r.ProviderVerificationMode ?? r.providerVerificationMode ?? "unknown",
    ),
    currentEnvironment: String(
      r.CurrentEnvironment ?? r.currentEnvironment ?? "unknown",
    ),
    generatedAt: String(r.GeneratedAt ?? r.generatedAt ?? ""),
    localMetrics: {
      environment: String(
        localMetricsRaw.Environment ?? localMetricsRaw.environment ?? "unknown",
      ),
      uptimeSeconds: Number(
        localMetricsRaw.UptimeSeconds ?? localMetricsRaw.uptimeSeconds ?? 0,
      ),
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

async function request<T>(
  path: string,
  options: RequestInit & { authToken?: string } = {},
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
    headers["X-Api-Base"] = getApiBaseUrl();
  } else {
    url = `${getApiBaseUrl()}/${pathNormalized}`;
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

    throw new Error(message);
  }

  return data as T;
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
    authToken?: string;
  }) => {
    const { authToken, ...filters } = params || {};
    const search = new URLSearchParams();
    if (filters.id != null) search.set("Id", String(filters.id));
    if (filters.industry) search.set("Industry", filters.industry);
    if (filters.isCompanyVerified != null)
      search.set("IsCompanyVerified", String(filters.isCompanyVerified));
    if (filters.query) search.set("Query", filters.query);

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

  verifyCompany: (id: number, verify: boolean, authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/companies/${id}/verify?verify=${verify}`,
      { method: "PATCH", authToken },
    ).then(mapCompanyLeanResponse),

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
    params?: { pageSize?: number; pageNumber?: number },
    authToken?: string,
  ) => {
    const search = new URLSearchParams();
    if (params?.pageSize != null)
      search.set("PageSize", String(params.pageSize));
    if (params?.pageNumber != null)
      search.set("PageNumber", String(params.pageNumber));
    const qs = search.toString();
    const path = qs
      ? `${BACKOFFICE}/companies/${companyId}/campaigns?${qs}`
      : `${BACKOFFICE}/companies/${companyId}/campaigns`;
    return request<Record<string, unknown>[]>(path, { authToken }).then(
      (list) => list.map(mapAdsCampaignResponse),
    );
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

  getPricingModels: (authToken?: string) =>
    request<Record<string, unknown>[]>(`${BACKOFFICE}/pricing`, {
      authToken,
    }).then((list) => list.map(mapPricingResponse)),

  createPricingModel: (payload: PricingModelRequest, authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/pricing`, {
      method: "POST",
      body: JSON.stringify({
        platform: payload.platform,
        thresholdStart: payload.thresholdStart,
        thresholdEnd: payload.thresholdEnd,
        amountPerMessage: payload.amountPerMessage,
        duration: payload.duration,
      }),
      authToken,
    }).then(mapPricingResponse),

  enablePricingModel: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/pricing/${id}/enable`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapPricingResponse),

  disablePricingModel: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(
      `${BACKOFFICE}/pricing/${id}/disable`,
      {
        method: "PATCH",
        authToken,
      },
    ).then(mapPricingResponse),

  updatePricingModel: (
    id: number,
    payload: EditPricingModelRequest,
    authToken?: string,
  ) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/pricing/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editPricingRequestToBody(payload)),
      authToken,
    }).then(mapPricingResponse),

  deletePricingModel: (id: number, authToken?: string) =>
    request<void>(`${BACKOFFICE}/pricing/${id}`, {
      method: "DELETE",
      authToken,
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

  getApmOverview: (authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/apm/overview`, {
      authToken,
    }).then(mapApmOverviewResponse),

  getApmChannels: (authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/apm/channels`, {
      authToken,
    }).then(mapApmChannelHealthResponse),

  getApmLinks: (authToken?: string) =>
    request<Record<string, unknown>>(`${BACKOFFICE}/apm/links`, {
      authToken,
    }).then(mapApmLinksResponse),
};
