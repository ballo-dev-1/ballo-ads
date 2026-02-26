export const DEV_API_BASE = 'https://api.balloads.com';
export const PROD_API_BASE = 'https://prod.balloads.com';

let currentBaseUrl =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : DEV_API_BASE;

export function getApiBaseUrl(): string {
  return currentBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  currentBaseUrl = url.replace(/\/+$/, '');
}

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

/** Normalize company response from backend (PascalCase or camelCase) to CompanyLeanResponse */
function mapCompanyLeanResponse(r: Record<string, unknown>): CompanyLeanResponse {
  return {
    id: (r.Id ?? r.id) as number,
    name: (r.Name ?? r.name) as string | undefined,
    description: (r.Description ?? r.description) as string | undefined,
    email: (r.Email ?? r.email) as string | undefined,
    phoneNumber: (r.PhoneNumber ?? r.phoneNumber) as string | undefined,
    physicalAddress: (r.PhysicalAddress ?? r.physicalAddress) as string | undefined,
    industry: (r.Industry ?? r.industry) as string,
    isCompanyVerified: (r.IsCompanyVerified ?? r.isCompanyVerified) as boolean,
    websiteUrl: (r.WebsiteUrl ?? r.websiteUrl) as string | undefined,
    facebookUrl: (r.FacebookUrl ?? r.facebookUrl) as string | undefined,
    twitterUrl: (r.TwitterUrl ?? r.twitterUrl) as string | undefined,
    linkedInUrl: (r.LinkedInUrl ?? r.linkedInUrl) as string | undefined,
    instagramUrl: (r.InstagramUrl ?? r.instagramUrl) as string | undefined,
    youtubeUrl: (r.YoutubeUrl ?? r.youtubeUrl) as string | undefined,
    senderId: (r.SenderId ?? r.senderId) as string | undefined,
    profileImageUrl: (r.ProfileImageUrl ?? r.profileImageUrl) as string | undefined,
    isApprovedSenderId: (r.IsApprovedSenderId ?? r.isApprovedSenderId) as boolean,
  };
}

/** Normalize campaign response (PascalCase or camelCase) to AdsCampaignResponse */
function mapAdsCampaignResponse(r: Record<string, unknown>): AdsCampaignResponse {
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
function mapCampaignLogResponse(r: Record<string, unknown>): CampaignLogResponse {
  return {
    id: (r.Id ?? r.id) as number,
    campaignId: (r.CampaignId ?? r.campaignId) as number,
    actorFirstName: (r.ActorFirstName ?? r.actorFirstName) as string | undefined,
    actorLastName: (r.ActorLastName ?? r.actorLastName) as string | undefined,
    initialStatus: (r.InitialStatus ?? r.initialStatus) as string | undefined,
    finalStatus: (r.FinalStatus ?? r.finalStatus) as string | undefined,
  };
}

/** Backend expects PascalCase; POST /pricing uses query params (see Swagger). */
function pricingRequestToBody(p: PricingModelRequest): Record<string, unknown> {
  return {
    Platform: p.platform,
    ThresholdStart: p.thresholdStart,
    ThresholdEnd: p.thresholdEnd,
    AmountPerMessage: p.amountPerMessage,
    Duration: p.duration,
  };
}

function pricingCreateQuery(p: PricingModelRequest): string {
  const q = pricingRequestToBody(p) as Record<string, string | number>;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    params.set(k, String(v));
  }
  return params.toString();
}

/** PATCH /pricing/{id}/update expects camelCase body per Swagger EditPricingModelRequest. */
function editPricingRequestToBody(p: EditPricingModelRequest): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.thresholdStart !== undefined) out.thresholdStart = p.thresholdStart;
  if (p.thresholdEnd !== undefined) out.thresholdEnd = p.thresholdEnd;
  if (p.amountPerMessage !== undefined) out.amountPerMessage = p.amountPerMessage;
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
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { authToken?: string } = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}/${path.replace(/^\/+/, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof options.headers === 'object' && options.headers !== null && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

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

    throw new Error(message);
  }

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

    return request<Record<string, unknown>[]>(path, { authToken }).then((list) =>
      list.map((r) => mapCompanyLeanResponse(r))
    );
  },

  getCompanyById: (id: number, authToken?: string) =>
    request<Record<string, unknown>>(`v1/companies/${id}`, { authToken }).then(
      mapCompanyLeanResponse
    ),

  approveCompanySenderId: (companyId: number, approve: boolean, authToken?: string) =>
    request<Record<string, unknown>>(`companies/${companyId}?approve=${approve}`, {
      method: 'PATCH',
      authToken,
    }).then(mapCompanyLeanResponse),

  approveCampaign: (
    companyId: number,
    campaignId: number,
    approve: boolean,
    authToken?: string
  ) =>
    request<Record<string, unknown>>(
      `companies/${companyId}/campaigns/${campaignId}?approve=${approve}`,
      {
        method: 'PATCH',
        authToken,
      }
    ).then(mapAdsCampaignResponse),

  /** GET /v1/companies/{id}/campaigns/all - list all campaigns for a company */
  getCompanyCampaignsAll: (
    companyId: number,
    params?: { pageSize?: number; pageNumber?: number },
    authToken?: string
  ) => {
    const search = new URLSearchParams();
    if (params?.pageSize != null) search.set('PageSize', String(params.pageSize));
    if (params?.pageNumber != null) search.set('PageNumber', String(params.pageNumber));
    const qs = search.toString();
    const path = qs ? `v1/companies/${companyId}/campaigns/all?${qs}` : `v1/companies/${companyId}/campaigns/all`;
    return request<Record<string, unknown>[]>(path, { authToken }).then((list) =>
      list.map(mapAdsCampaignResponse)
    );
  },

  /** PATCH /v1/companies/{id}/campaigns/{campaignId}/activate */
  activateCampaign: (companyId: number, campaignId: number, authToken?: string) =>
    request<Record<string, unknown>>(
      `v1/companies/${companyId}/campaigns/${campaignId}/activate`,
      { method: 'PATCH', authToken }
    ).then(mapAdsCampaignResponse),

  /** PATCH /v1/companies/{id}/campaigns/{campaignId}/cancel */
  cancelCampaign: (companyId: number, campaignId: number, authToken?: string) =>
    request<Record<string, unknown>>(
      `v1/companies/${companyId}/campaigns/${campaignId}/cancel`,
      { method: 'PATCH', authToken }
    ).then(mapAdsCampaignResponse),

  /** GET /v1/companies/{id}/campaigns/{campaignId}/logs */
  getCampaignLogs: (companyId: number, campaignId: number, authToken?: string) =>
    request<Record<string, unknown>[]>(
      `v1/companies/${companyId}/campaigns/${campaignId}/logs`,
      { authToken }
    ).then((list) => list.map(mapCampaignLogResponse)),

  getPricingModels: (authToken?: string) =>
    request<Record<string, unknown>[]>('pricing', { authToken }).then((list) =>
      list.map(mapPricingResponse)
    ),

  createPricingModel: (payload: PricingModelRequest, authToken?: string) => {
    const query = pricingCreateQuery(payload);
    const path = query ? `pricing?${query}` : 'pricing';
    return request<Record<string, unknown>>(path, {
      method: 'POST',
      authToken,
    }).then(mapPricingResponse);
  },

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
      body: JSON.stringify(editPricingRequestToBody(payload)),
      authToken,
    }).then(mapPricingResponse),
};


