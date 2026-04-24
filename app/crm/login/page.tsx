"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCrmTokens, getCrmApiBase, getCrmToken, setCrmTokens, setCrmUser } from "@/lib/crmApiClient";

export default function CrmLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getReturnUrl = () => {
    if (typeof window === "undefined") return "/crm";
    const params = new URLSearchParams(window.location.search);
    const ret = params.get("return");
    return ret?.startsWith("/crm") ? ret : "/crm";
  };

  useEffect(() => {
    const token = getCrmToken();
    if (!token) return;
    fetch(`${getCrmApiBase()}/api/crm/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.authenticated) {
          router.replace(getReturnUrl());
        } else {
          clearCrmTokens();
        }
      })
      .catch(() => clearCrmTokens());
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${getCrmApiBase()}/api/crm/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        refreshToken?: string;
        user?: { id: string; name: string; email: string; role: string };
      };
      if (!response.ok) {
        setError(json.error || "Login failed");
        return;
      }
      if (!json.token) {
        setError("Login failed");
        return;
      }
      setCrmTokens(json.token, json.refreshToken);
      setCrmUser(json.user ?? null);
      window.location.assign("/crm");
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1437] px-4 py-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(139,92,246,0.12), transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111C47] shadow-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-2 flex items-center gap-3">
          <div className="w-11 h-11 bg-[#3B82F6] rounded-[10px] flex items-center justify-center font-bold text-white text-lg font-syne">
            B
          </div>
          <div>
            <h1 className="font-syne text-[18px] font-bold text-slate-100">BalloAds CRM</h1>
            <p className="text-[11.5px] text-slate-500 tracking-[0.05em] uppercase">Internal tool</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@balloads.com"
              className="crm-input w-full"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Enter your password"
              className="crm-input w-full"
            />
          </div>
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
              {error}
            </div>
          ) : null}
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-[#3B82F6] hover:bg-blue-600 py-2.5 text-[13px] text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Staff access only. Issues? Contact the BalloAds platform team.
          </p>
        </form>
      </div>
    </div>
  );
}
