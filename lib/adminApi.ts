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
  companyId: number;
  creatorId: number;
  startDate: string;
  endDate: string;
  status: string;
  mediaFileUrl?: string;
  isApproved: boolean;
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
  }
}

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
    const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const message =
      (d && (typeof d.message === 'string' ? d.message : typeof d.detail === 'string' ? d.detail : typeof d.title === 'string' ? d.title : null)) ||
      'Request failed';

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
    request<Record<string, unknown>[]>('pricing', { authToken }).then((list) =>
      list.map(mapPricingResponse)
    ),

  createPricingModel: (payload: PricingModelRequest, authToken?: string) =>
    request<Record<string, unknown>>('pricing', {
      method: 'POST',
      body: JSON.stringify(payload),
      authToken,
    }).then(mapPricingResponse),

  enablePricingModel: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(`pricing/${id}/enable`, {
      method: 'PATCH',
      authToken,
    }).then(mapPricingResponse),

  disablePricingModel: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(`pricing/${id}/disable`, {
      method: 'PATCH',
      authToken,
    }).then(mapPricingResponse),

  updatePricingModel: (id: number, payload: EditPricingModelRequest, authToken?: string) =>
    request<Record<string, unknown>>(`pricing/${id}/update`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      authToken,
    }).then(mapPricingResponse),
};


