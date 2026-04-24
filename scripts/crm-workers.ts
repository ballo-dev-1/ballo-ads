import { runDataSyncJob, runHealthScoreJob, runJourneyEngine } from "@/lib/crmJobs";

async function main() {
  await runJourneyEngine();
  await runHealthScoreJob();
  await runDataSyncJob();
  // eslint-disable-next-line no-console
  console.log("CRM worker run complete");
}

void main();
