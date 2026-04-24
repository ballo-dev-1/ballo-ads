"use client";

export async function crmFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as T & { error?: string; message?: string };
  if (!response.ok) {
    const message = (json as { message?: string; error?: string }).message || (json as { error?: string }).error || "Request failed";
    throw new Error(message);
  }
  return json;
}
