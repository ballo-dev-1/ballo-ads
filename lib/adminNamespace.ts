export type AdminEnv = "prod" | "dev" | "staging";

export type AdminBasePath = "/admin" | "/dev-admin" | "/staging-admin";

export function getAdminBasePath(pathname: string | null | undefined): AdminBasePath {
  if (pathname?.startsWith("/staging-admin")) return "/staging-admin";
  if (pathname?.startsWith("/dev-admin")) return "/dev-admin";
  return "/admin";
}

export function getAdminEnvFromPathname(pathname: string | null | undefined): AdminEnv {
  const basePath = getAdminBasePath(pathname);
  if (basePath === "/staging-admin") return "staging";
  if (basePath === "/dev-admin") return "dev";
  return "prod";
}

function normalizeHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  const firstHost = rawHost.split(",")[0]?.trim().toLowerCase();
  if (!firstHost) return null;
  return firstHost.replace(/:\d+$/, "");
}

function getAdminEnvFromHost(host: string | null | undefined): AdminEnv | null {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return null;

  if (
    normalizedHost === "dev.balloads.com" ||
    normalizedHost === "dev.localhost"
  ) {
    return "dev";
  }
  if (
    normalizedHost === "staging.balloads.com" ||
    normalizedHost === "staging.localhost"
  ) {
    return "staging";
  }
  if (
    normalizedHost === "balloads.com" ||
    normalizedHost === "www.balloads.com" ||
    normalizedHost.endsWith(".balloads.com")
  ) {
    return "prod";
  }

  return null;
}

export function getAdminEnv(input: {
  pathname: string | null | undefined;
  host?: string | null | undefined;
}): AdminEnv {
  return getAdminEnvFromHost(input.host) ?? getAdminEnvFromPathname(input.pathname);
}
