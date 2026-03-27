export function dashboardStatsWarningMessage(
  settledResults: Array<PromiseSettledResult<unknown>>,
): string {
  const failures = settledResults.filter((result) => result.status === "rejected").length;
  if (failures === 0) return "";
  if (failures === settledResults.length) {
    return "Unable to load dashboard stats right now.";
  }
  return "Some dashboard sections are unavailable. Partial data is shown.";
}
