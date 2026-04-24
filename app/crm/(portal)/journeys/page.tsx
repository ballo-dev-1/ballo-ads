"use client";

import { FormEvent, useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

type Journey = { id: string; name: string; status: string };

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const json = await crmFetch<{ data: Journey[] }>("/api/crm/v1/journeys");
    setJourneys(json.data);
  }
  useEffect(() => {
    void load();
  }, []);

  async function createJourney(event: FormEvent) {
    event.preventDefault();
    await crmFetch("/api/crm/v1/journeys", {
      method: "POST",
      body: JSON.stringify({ name, flowDefinition: { nodes: [{ id: "start" }], edges: [] } }),
    });
    setName("");
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Journey Builder</h1>
      <form onSubmit={createJourney} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-white/10 bg-slate-900 px-3 py-2" placeholder="Journey name" />
        <button className="rounded bg-blue-600 px-3 py-2">Create</button>
      </form>
      <div className="mt-4 space-y-2">
        {journeys.map((journey) => (
          <div key={journey.id} className="rounded-lg border border-white/10 bg-slate-900 p-3">
            {journey.name} - {journey.status}
          </div>
        ))}
      </div>
    </div>
  );
}
