const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.balloads.com';

export type AuthResponse = {
  token: string;
  refreshToken: string;
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
  recipients?: CampaignRecipientResponse[];
  companyId: number;
  creatorId: number;
  startDate: string;
  endDate: string;
  status: string;
  mediaFileUrl?: string;
  isApproved: boolean;
};

export type CampaignRecipientResponse = {
  id: number;
  account: string;
  channel: string;
  messageDispatched: boolean;
  status: string;
  attemptCount: number;
  nextAttemptAt?: string | null;
  claimedAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  createdAt: string;
  purchaseOrderId?: number | null;
  name?: string | null;
  updatedAt: string;
};

export type DashboardAnalyticsCampaignRecipientDetail = {
  campaignId: number;
  campaignName: string;
  campaignChannel: string;
  recipient: CampaignRecipientResponse;
};

export type AnalyticsAppliedFilters = {
  from: string;
  to: string;
  companyId?: number | null;
  channel?: string | null;
};

export type DashboardAnalyticsCampaignPerformanceResponse = {
  generatedAt: string;
  appliedFilters: AnalyticsAppliedFilters;
  campaignRecipientDetails: DashboardAnalyticsCampaignRecipientDetail[];
  totalCampaigns: number;
  completedCampaigns: number;
  completionRate: number;
  totalRecipients: number;
  dispatchedRecipients: number;
  dispatchRate: number;
  ctaClicks: number;
  uniqueCtaClicks: number;
  clickThroughRate: number;
  emailCtaLinksSent: number;
  emailCtaClicks: number;
  emailCtaUniqueClicks: number;
  emailCtaClickThroughRate: number;
  maskedLinksSent: number;
  campaignsWithLinks: number;
  averageClicksPerCampaign: number;
  averageTimeToCompleteHours: number;
  byChannel: Array<{
    channel: string;
    campaigns: number;
    completedCampaigns: number;
    completionRate: number;
    totalRecipients: number;
    dispatchedRecipients: number;
    dispatchRate: number;
    ctaClicks: number;
    uniqueCtaClicks: number;
    clickThroughRate: number;
    emailCtaLinksSent: number;
    emailCtaClicks: number;
    emailCtaUniqueClicks: number;
    emailCtaClickThroughRate: number;
  }>;
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

async function request<T>(
  path: string,
  options: RequestInit & { authToken?: string } = {}
): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'lib/adminApi.ts:request:before',
      message: 'adminApi request start',
      data: {
        url,
        method: options.method ?? 'GET',
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? (data as { message?: string }).message
        : null) || 'Request failed';

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H2',
        location: 'lib/adminApi.ts:request:error',
        message: 'adminApi request error',
        data: {
          url,
          status: res.status,
          statusText: res.statusText,
          parsedBody: data,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    throw new Error(message);
  }

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'lib/adminApi.ts:request:success',
      message: 'adminApi request success',
      data: {
        url,
        status: res.status,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return data as T;
}

export const adminApi = {
  login: (username: string, password: string) =>
    request<AuthResponse>('v1/auth/login', {
      method: 'POST',
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
    if (filters.id != null) search.set('Id', String(filters.id));
    if (filters.industry) search.set('Industry', filters.industry);
    if (filters.isCompanyVerified != null)
      search.set('IsCompanyVerified', String(filters.isCompanyVerified));
    if (filters.query) search.set('Query', filters.query);

    const qs = search.toString();
    const path = qs ? `companies?${qs}` : 'companies';

    return request<CompanyLeanResponse[]>(path, { authToken });
  },

  approveCompanySenderId: (companyId: number, approve: boolean, authToken?: string) =>
    request<CompanyLeanResponse>(`companies/${companyId}?approve=${approve}`, {
      method: 'PATCH',
      authToken,
    }),

  approveCampaign: (
    companyId: number,
    campaignId: number,
    approve: boolean,
    authToken?: string
  ) =>
    request<AdsCampaignResponse>(
      `companies/${companyId}/campaigns/${campaignId}?approve=${approve}`,
      {
        method: 'PATCH',
        authToken,
      }
    ),

  getPricingModels: (authToken?: string) =>
    request<PricingModelResponse[]>('pricing', { authToken }),

  createPricingModel: (payload: PricingModelRequest, authToken?: string) =>
    request<PricingModelResponse>('pricing', {
      method: 'POST',
      body: JSON.stringify(payload),
      authToken,
    }),

  enablePricingModel: (id: number, authToken?: string) =>
    request<PricingModelResponse>(`pricing/${id}/enable`, {
      method: 'PATCH',
      authToken,
    }),

  disablePricingModel: (id: number, authToken?: string) =>
    request<PricingModelResponse>(`pricing/${id}/disable`, {
      method: 'PATCH',
      authToken,
    }),

  updatePricingModel: (id: number, payload: EditPricingModelRequest, authToken?: string) =>
    request<PricingModelResponse>(`pricing/${id}/update`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      authToken,
    }),

  getDashboardAnalyticsCampaignPerformance: (params?: {
    from?: string;
    to?: string;
    companyId?: number;
    channel?: string;
    authToken?: string;
  }) => {
    const { authToken, ...filters } = params || {};
    const search = new URLSearchParams();
    if (filters.from) search.set('from', filters.from);
    if (filters.to) search.set('to', filters.to);
    if (filters.companyId != null) search.set('companyId', String(filters.companyId));
    if (filters.channel) search.set('channel', filters.channel);

    const qs = search.toString();
    const path = qs
      ? `Backoffice/analytics/campaign-performance?${qs}`
      : `Backoffice/analytics/campaign-performance`;

    return request<DashboardAnalyticsCampaignPerformanceResponse>(path, { authToken });
  },
};


