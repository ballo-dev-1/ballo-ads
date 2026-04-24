export type InternalUserRole = "viewer" | "editor" | "admin";

export type AccountStatus = "active" | "at_risk" | "churned" | "suspended";
export type PlanTier = "Standard" | "Pro" | "Enterprise";
export type Channel = "sms" | "email" | "whatsapp" | "popup" | "inbox";
export type SegmentType = "dynamic" | "static";
export type JourneyStatus = "draft" | "active" | "paused" | "archived";
export type CampaignStatus = "draft" | "active" | "scheduled" | "completed" | "paused";

export type InternalUser = {
  id: string;
  name: string;
  email: string;
  role: InternalUserRole;
  isInternal: boolean;
};

export type CrmUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: InternalUserRole;
  isInternal: boolean;
  createdAt: string;
};

export type Client = {
  id: string;
  companyName: string;
  industry: string;
  region: string;
  balloadsAccountId: string;
  planTier: PlanTier;
  accountStatus: AccountStatus;
  healthScore: number;
  creditsRemaining: number;
  lastActiveAt: string | null;
  signedUpAt: string;
  syncedAt: string;
};

export type SegmentRule = {
  attr: string;
  op: string;
  val: string;
};

export type Segment = {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  rules: SegmentRule[];
  clientCount: number;
  lastEvaluatedAt: string | null;
  createdAt: string;
  archivedAt: string | null;
};

export type Journey = {
  id: string;
  name: string;
  status: JourneyStatus;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  flowDefinition: { nodes: unknown[]; edges: unknown[] };
  entrySegmentId: string | null;
  maxDurationDays: number;
  entryMode: "once_per_client" | "once_during_open" | "recurring";
  createdBy: string;
  activatedAt: string | null;
  createdAt: string;
};

export type Campaign = {
  id: string;
  name: string;
  journeyId: string | null;
  segmentId: string | null;
  channel: Channel;
  status: CampaignStatus;
  content: Record<string, unknown>;
  scheduledAt: string | null;
  sentAt: string | null;
  userLimit: number;
  execSpeed: number;
  createdAt: string;
};

export type MessageLog = {
  id: string;
  campaignId: string;
  clientId: string;
  channel: Channel;
  status: "queued" | "sent" | "delivered" | "failed" | "opened" | "clicked";
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
};

export type TrackedLink = {
  id: string;
  originalUrl: string;
  shortCode: string;
  campaignId: string | null;
  clickCount: number;
  createdAt: string;
};

export type LinkClick = {
  id: string;
  trackedLinkId: string;
  clientId: string | null;
  userAgent: string | null;
  ipHash: string | null;
  clickedAt: string;
};

export type ClientAttribute = {
  id: string;
  clientId: string;
  key: string;
  value: string;
  updatedAt: string;
};

export type CrmAuditLog = {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CrmData = {
  users: CrmUser[];
  clients: Client[];
  segments: Segment[];
  journeys: Journey[];
  campaigns: Campaign[];
  messageLogs: MessageLog[];
  trackedLinks: TrackedLink[];
  linkClicks: LinkClick[];
  clientAttributes: ClientAttribute[];
  auditLogs: CrmAuditLog[];
};
