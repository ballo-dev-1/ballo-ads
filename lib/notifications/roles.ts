function canonicalRole(role: string): string {
  return role.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isNotificationVisibleToRoles(
  targetRoles: string[] | null | undefined,
  userRoles: string[],
): boolean {
  const targets = Array.isArray(targetRoles) ? targetRoles : [];
  if (targets.length === 0) return true;
  if (!Array.isArray(userRoles) || userRoles.length === 0) return false;

  const userSet = new Set(userRoles.map(canonicalRole));
  return targets.some((target) => userSet.has(canonicalRole(target)));
}
