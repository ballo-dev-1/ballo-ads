import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Campaign,
  Client,
  ClientAttribute,
  CrmAuditLog,
  CrmData,
  CrmUser,
  InternalUser,
  Journey,
  LinkClick,
  MessageLog,
  Segment,
  SegmentRule,
  TrackedLink,
} from "@/lib/crmTypes";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "crm.json");

function nowIso() {
  return new Date().toISOString();
}

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function seedUsers(): CrmUser[] {
  const now = nowIso();
  return [
    {
      id: randomUUID(),
      name: "CRM Admin",
      email: "crm@balloads.com",
      passwordHash: hashPassword("Admin@12345"),
      role: "admin",
      isInternal: true,
      createdAt: now,
    },
  ];
}

function demoClients(): Client[] {
  const now = nowIso();
  return [
    {
      id: randomUUID(),
      companyName: "Acme Insurance Zambia",
      industry: "Insurance",
      region: "Lusaka, Zambia",
      balloadsAccountId: "acct_1001",
      planTier: "Pro",
      accountStatus: "active",
      healthScore: 78,
      creditsRemaining: 4200,
      lastActiveAt: now,
      signedUpAt: now,
      syncedAt: now,
    },
    {
      id: randomUUID(),
      companyName: "Green Retail Hub",
      industry: "Retail",
      region: "Ndola, Zambia",
      balloadsAccountId: "acct_1002",
      planTier: "Standard",
      accountStatus: "at_risk",
      healthScore: 33,
      creditsRemaining: 500,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
      signedUpAt: now,
      syncedAt: now,
    },
  ];
}

function initialData(): CrmData {
  return {
    users: seedUsers(),
    clients: demoClients(),
    segments: [],
    journeys: [],
    campaigns: [],
    messageLogs: [],
    trackedLinks: [],
    linkClicks: [],
    clientAttributes: [],
    auditLogs: [],
  };
}

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(initialData(), null, 2), "utf8");
  }
}

export async function readCrmData(): Promise<CrmData> {
  await ensureDataFile();
  const content = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(content) as Partial<CrmData>;
  const users = Array.isArray(parsed.users) ? parsed.users : [];
  const seededAdmin = seedUsers()[0];
  const hasAdmin = users.some((user) => user.role === "admin");
  const legacyAdmin = users.find((user) => user.email.toLowerCase() === "crm.admin@balloads.local");
  let nextUsers = users;

  if (legacyAdmin) {
    nextUsers = users.map((user) =>
      user.id === legacyAdmin.id
        ? {
            ...user,
            email: seededAdmin.email,
            role: "admin",
            isInternal: true,
          }
        : user,
    );
  }

  if (!hasAdmin) {
    const hydrated = {
      ...parsed,
      users: [seededAdmin, ...nextUsers],
    } as CrmData;
    await writeFile(DATA_FILE, JSON.stringify(hydrated, null, 2), "utf8");
    return hydrated;
  }

  if (nextUsers !== users) {
    const hydrated = {
      ...parsed,
      users: nextUsers,
    } as CrmData;
    await writeFile(DATA_FILE, JSON.stringify(hydrated, null, 2), "utf8");
    return hydrated;
  }

  return parsed as CrmData;
}

export async function writeCrmData(data: CrmData) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function evaluateRules(clients: Client[], rules: SegmentRule[]) {
  if (rules.length === 0) return clients;
  return clients.filter((client) =>
    rules.every((rule) => {
      const attrMap: Record<string, unknown> = {
        health_score: client.healthScore,
        plan: client.planTier,
        industry: client.industry,
        credits: client.creditsRemaining,
        status: client.accountStatus,
      };
      const actual = attrMap[rule.attr] ?? "";
      const expectedNumber = Number(rule.val);
      const actualNumber = Number(actual);
      switch (rule.op) {
        case "<":
          return Number.isFinite(actualNumber) && actualNumber < expectedNumber;
        case ">":
          return Number.isFinite(actualNumber) && actualNumber > expectedNumber;
        case "<=":
          return Number.isFinite(actualNumber) && actualNumber <= expectedNumber;
        case ">=":
          return Number.isFinite(actualNumber) && actualNumber >= expectedNumber;
        case "=":
          return String(actual).toLowerCase() === rule.val.toLowerCase();
        case "contains":
          return String(actual).toLowerCase().includes(rule.val.toLowerCase());
        default:
          return false;
      }
    }),
  );
}

export function appendAuditLog(data: CrmData, user: InternalUser, action: string, entityType: string, entityId: string, payload: Record<string, unknown>) {
  const audit: CrmAuditLog = {
    id: randomUUID(),
    actorId: user.id,
    actorEmail: user.email,
    action,
    entityType,
    entityId,
    payload,
    createdAt: nowIso(),
  };
  data.auditLogs.unshift(audit);
}

export function createShortCode() {
  return Math.random().toString(36).slice(2, 8);
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
}

export function pushMessageLogsForCampaign(data: CrmData, campaign: Campaign, clientIds: string[]) {
  const logs: MessageLog[] = clientIds.map((clientId) => ({
    id: randomUUID(),
    campaignId: campaign.id,
    clientId,
    channel: campaign.channel,
    status: "delivered",
    sentAt: nowIso(),
    deliveredAt: nowIso(),
    openedAt: null,
    clickedAt: null,
  }));
  data.messageLogs.push(...logs);
}

export function upsertClientNote(data: CrmData, clientId: string, note: string) {
  const existing = data.clientAttributes.find((item) => item.clientId === clientId && item.key === "crm_notes");
  if (existing) {
    existing.value = note;
    existing.updatedAt = nowIso();
    return existing;
  }
  const newAttr: ClientAttribute = {
    id: randomUUID(),
    clientId,
    key: "crm_notes",
    value: note,
    updatedAt: nowIso(),
  };
  data.clientAttributes.push(newAttr);
  return newAttr;
}

export function registerLinkClick(data: CrmData, link: TrackedLink, userAgent: string | null, ip: string | null) {
  link.clickCount += 1;
  const click: LinkClick = {
    id: randomUUID(),
    trackedLinkId: link.id,
    clientId: null,
    userAgent,
    ipHash: hashIp(ip),
    clickedAt: nowIso(),
  };
  data.linkClicks.push(click);
}

export type CrmEntity = Client | Segment | Journey | Campaign | TrackedLink;
