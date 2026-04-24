import { readCrmData, writeCrmData } from "@/lib/crmStore";

export async function runHealthScoreJob() {
  const data = await readCrmData();
  for (const client of data.clients) {
    if (!client.lastActiveAt) continue;
    const daysSinceActivity = (Date.now() - new Date(client.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity > 30) client.healthScore = Math.max(10, client.healthScore - 10);
  }
  await writeCrmData(data);
}

export async function runJourneyEngine() {
  const data = await readCrmData();
  for (const journey of data.journeys) {
    if (journey.status !== "active") continue;
    journey.activatedAt = journey.activatedAt ?? new Date().toISOString();
  }
  await writeCrmData(data);
}

export async function runDataSyncJob() {
  const data = await readCrmData();
  const now = new Date().toISOString();
  for (const client of data.clients) client.syncedAt = now;
  await writeCrmData(data);
}
