export function biStatsWarningMessage(
  sections: PromiseSettledResult<unknown>[],
): string {
  if (sections.length === 0) return "";
  const failed = sections.filter((section) => section.status === "rejected").length;
  if (failed === 0) return "";
  if (failed === sections.length) return "Unable to load BI analytics right now.";
  return "Some BI sections are unavailable. Partial data is shown.";
}
