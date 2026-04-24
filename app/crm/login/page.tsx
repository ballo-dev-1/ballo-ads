"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CrmLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/crm/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.authenticated) {
          const ret = searchParams.get("return");
          router.replace(ret?.startsWith("/crm") ? ret : "/crm");
        }
      })
      .catch(() => undefined);
  }, [router, searchParams]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/crm/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(json.error || "Login failed");
        return;
      }
      window.location.assign("/crm");
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-900">CRM Login</h1>
        <p className="mt-1 text-sm text-slate-600">Use your internal staff account.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} type="submit" className="w-full rounded-lg bg-slate-900 py-3 text-white disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
