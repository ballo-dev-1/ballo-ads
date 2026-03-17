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
