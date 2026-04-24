"use client";

import { useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

type ClientsResponse = { data: { data: Array<{ id: string; companyName: string; industry: string; healthScore: number; accountStatus: string }> } };

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientsResponse["data"]["data"]>([]);
  useEffect(() => {
    crmFetch<ClientsResponse>("/api/crm/v1/clients").then((json) => setClients(json.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Clients</h1>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left">Company</th>
              <th className="px-3 py-2 text-left">Industry</th>
              <th className="px-3 py-2 text-left">Health</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-white/5">
                <td className="px-3 py-2">{client.companyName}</td>
                <td className="px-3 py-2">{client.industry}</td>
                <td className="px-3 py-2">{client.healthScore}</td>
                <td className="px-3 py-2">{client.accountStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
