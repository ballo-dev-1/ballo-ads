"use client";

import { FormEvent, useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

type Campaign = { id: string; name: string; channel: string; status: string };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("sms");

  async function load() {
    const json = await crmFetch<{ data: Campaign[] }>("/api/crm/v1/campaigns");
    setCampaigns(json.data);
  }
  useEffect(() => {
    void load();
  }, []);

  async function createCampaign(event: FormEvent) {
    event.preventDefault();
    await crmFetch("/api/crm/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({ name, channel, content: { msg: "Hello from CRM" } }),
    });
    setName("");
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Campaign Builder</h1>
      <form onSubmit={createCampaign} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-white/10 bg-slate-900 px-3 py-2" placeholder="Campaign name" />
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded border border-white/10 bg-slate-900 px-3 py-2">
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="popup">Popup</option>
          <option value="inbox">Inbox</option>
        </select>
        <button className="rounded bg-blue-600 px-3 py-2">Create</button>
      </form>
      <div className="mt-4 space-y-2">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-lg border border-white/10 bg-slate-900 p-3">
            {campaign.name} - {campaign.channel} - {campaign.status}
          </div>
        ))}
      </div>
    </div>
  );
}
