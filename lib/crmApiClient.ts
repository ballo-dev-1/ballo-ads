"use client";

import toast from "react-hot-toast";
import type {
  Campaign,
  Client,
  Journey,
  Segment,
  SegmentRule,
  TrackedLink,
} from "@/lib/crmTypes";

type Query = Record<string, string | number | boolean | undefined | null>;
type PaginatedList<T> = { data: T[]; total: number; page: number; limit: number; hasMore: boolean };

const DEV_API_BASE = process.env.NEXT_PUBLIC_DEV_API_URL || "https://dev-api.balloads.com";
const STAGING_API_BASE = process.env.NEXT_PUBLIC_STAGING_API_URL || "https://staging-api.balloads.com";
const PROD_API_BASE = process.env.NEXT_PUBLIC_PROD_API_URL || "https://api.balloads.com";

const CRM_TOKEN_KEY = "crm-token";
const CRM_REFRESH_TOKEN_KEY = "crm-refresh-token";

function currentApiBase() {
  if (typeof window === "undefined") return PROD_API_BASE.replace(/\/+$/, "");
  const host = window.location.hostname.toLowerCase();
  if (host.includes("dev") || host === "localhost") return DEV_API_BASE.replace(/\/+$/, "");
  if (host.includes("staging")) return STAGING_API_BASE.replace(/\/+$/, "");
  return PROD_API_BASE.replace(/\/+$/, "");
}

export function getCrmApiBase() {
  return currentApiBase();
}

const CRM_BASE_PATH = "/api/crm/v1";

function buildUrl(path: string, params?: Query) {
  const url = new URL(`${currentApiBase()}${CRM_BASE_PATH}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function getCrmToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CRM_TOKEN_KEY);
}

export function setCrmTokens(token: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CRM_TOKEN_KEY, token);
  if (refreshToken) window.localStorage.setItem(CRM_REFRESH_TOKEN_KEY, refreshToken);
}

export function setCrmUser(user: { id: string; name?: string; email?: string; role?: string } | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem("crm-user");
    return;
  }
  window.localStorage.setItem("crm-user", JSON.stringify(user));
}

export function getCrmUser(): { id: string; name?: string; email?: string; role?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("crm-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; name?: string; email?: string; role?: string };
  } catch {
    return null;
  }
}

export function clearCrmTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CRM_TOKEN_KEY);
  window.localStorage.removeItem(CRM_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem("crm-user");
}

async function request<TPayload>(
  method: string,
  path: string,
  body?: unknown,
  params?: Query,
  opts?: { form?: FormData; signal?: AbortSignal },
): Promise<TPayload> {
  const token = getCrmToken();
  const headers: HeadersInit = opts?.form
    ? {}
    : { "Content-Type": "application/json" };
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
    signal: opts?.signal,
  };
  if (opts?.form) init.body = opts.form;
  else if (body !== undefined) init.body = JSON.stringify(body);

  const response = await fetch(buildUrl(path, params), init);
  const json = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    data?: unknown;
  } & Record<string, unknown>;
  if (!response.ok) {
    if (response.status === 401) {
      clearCrmTokens();
      if (typeof window !== "undefined") window.location.href = "/crm/login";
      throw new Error("Unauthorized");
    }
    const msg = (json.message || json.error || "Request failed") as string;
    if (response.status === 403) toast.error("You do not have permission to perform this action");
    else toast.error(msg);
    throw new Error(msg);
  }
  const payload = (json.data ?? json) as TPayload;
  return payload;
}

export const crmApi = {
  get: <T>(path: string, params?: Query) => request<T>("GET", path, undefined, params),
  post: <T>(path: string, body?: unknown, params?: Query) => request<T>("POST", path, body, params),
  put: <T>(path: string, body?: unknown, params?: Query) => request<T>("PUT", path, body, params),
  patch: <T>(path: string, body?: unknown, params?: Query) => request<T>("PATCH", path, body, params),
  delete: <T>(path: string, params?: Query) => request<T>("DELETE", path, undefined, params),
  postForm: <T>(path: string, form: FormData) => request<T>("POST", path, undefined, undefined, { form }),
};

export type ClientDetail = Client & {
  usageEvents?: Array<{ id: string; eventType: string; occurredAt: string; channel?: string }>;
  contacts?: Array<{ id: string; email?: string; phone?: string; name?: string }>;
  attributes?: Array<{ key: string; value: string; updatedAt: string }>;
};

export const clientsApi = {
  list: (params?: Query) => crmApi.get<PaginatedList<Client>>("/clients", params),
  get: (id: string) => crmApi.get<ClientDetail>(`/clients/${id}`),
  sync: (id: string) => crmApi.post<{ message: string }>(`/clients/${id}/sync`),
  flag: (id: string) => crmApi.post<{ message: string }>(`/clients/${id}/flag`),
  addNote: (id: string, text: string) =>
    crmApi.post<{ message: string }>(`/clients/${id}/notes`, { text }),
  syncAll: () => crmApi.post<{ queued: boolean; message: string }>("/clients", { trigger: "sync-all" }),
};

export const segmentsApi = {
  list: () => crmApi.get<Segment[]>("/segments"),
  get: (id: string) => crmApi.get<Segment>(`/segments/${id}`),
  getClients: (id: string) => crmApi.get<{ data: Client[]; count: number }>(`/segments/${id}/clients`),
  create: (data: { name: string; description?: string; rules: SegmentRule[]; manualContacts?: string[] }) =>
    crmApi.post<Segment>("/segments", data),
  delete: (id: string) => crmApi.delete<{ message: string }>(`/segments/${id}`),
  estimateReach: (rules: SegmentRule[]) =>
    crmApi.post<{ count: number; clientIds: string[] }>("/segments/estimate", { rules }),
  addMembers: (id: string, companyIds: string[]) =>
    crmApi.post<{ added: number; total: number }>(`/segments/${id}/members`, { companyIds }),
};

export const journeysApi = {
  list: () => crmApi.get<Journey[]>("/journeys"),
  get: (id: string) => crmApi.get<Journey>(`/journeys/${id}`),
  create: (data: Record<string, unknown>) => crmApi.post<Journey>("/journeys", data),
  update: (id: string, data: Record<string, unknown>) => crmApi.put<Journey>(`/journeys/${id}`, data),
  activate: (id: string) => crmApi.post<{ message: string }>(`/journeys/${id}/activate`),
  pause: (id: string) => crmApi.post<{ message: string }>(`/journeys/${id}/pause`),
  analytics: (id: string) =>
    crmApi.get<{ totalEnrolments: number; completed: number; conversionRate: number; funnel: Array<{ nodeId: string; nodeName: string; nodeType: string; count: number }> }>(`/journeys/${id}/analytics`),
  enrol: (triggerType: string, companyId: string) =>
    crmApi.post<{ enrolled: number }>("/journeys/enrol", { triggerType, companyId }),
};

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  ctr: number;
  byDay: Array<{ day: string; sent: number }>;
}

export const campaignsApi = {
  list: (params?: Query) => crmApi.get<Campaign[]>("/campaigns", params),
  get: (id: string) => crmApi.get<Campaign>(`/campaigns/${id}`),
  create: (data: Record<string, unknown>) => crmApi.post<Campaign>("/campaigns", data),
  stats: (id: string) => crmApi.get<CampaignStats>(`/campaigns/${id}/stats`),
  cancel: (id: string) => crmApi.delete<{ message: string }>(`/campaigns/${id}`),
};

export const linksApi = {
  create: (originalUrl: string, campaignId?: string) =>
    crmApi.post<TrackedLink & { shortUrl: string }>("/links", {
      originalUrl,
      ...(campaignId ? { campaignId } : {}),
    }),
  stats: (shortCode: string) => crmApi.get<TrackedLink>(`/links/${shortCode}/stats`),
};

export interface AnalyticsOverview {
  totalClients: number;
  activeJourneys: number;
  messagesSentMtd: number;
  atRiskCount: number;
}

export interface AnalyticsMessagesRow {
  month: string;
  sms: number;
  email: number;
  whatsapp: number;
  popup: number;
  inbox: number;
  total: number;
}

export interface AnalyticsHealth {
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  avgScore: number;
  total: number;
}

export interface AnalyticsRetention {
  churnRate: number;
  retentionScore: number;
  avgOpenRate: number;
  totalClients: number;
  churnedThisMonth: number;
  ctr?: number;
}

export const analyticsApi = {
  overview: () => crmApi.get<AnalyticsOverview>("/analytics/overview"),
  messages: () => crmApi.get<AnalyticsMessagesRow[]>("/analytics/messages"),
  health: () => crmApi.get<AnalyticsHealth>("/analytics/health"),
  retention: () => crmApi.get<AnalyticsRetention>("/analytics/retention"),
  campaign: (id: string) => crmApi.get<CampaignStats>(`/analytics/campaigns/${id}`),
};

export const uploadsApi = {
  uploadImage: (file: File, folder = "popup-images") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return crmApi.postForm<{ url: string; key: string; size: number }>("/uploads/image", form);
  },
};
