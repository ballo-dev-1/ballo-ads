"use client";

import { FormEvent, useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

type Segment = { id: string; name: string; type: string; clientCount: number };

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const json = await crmFetch<{ data: Segment[] }>("/api/crm/v1/segments");
    setSegments(json.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createSegment(event: FormEvent) {
    event.preventDefault();
    await crmFetch("/api/crm/v1/segments", {
      method: "POST",
      body: JSON.stringify({ name, rules: [] }),
    });
    setName("");
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Segments</h1>
      <form onSubmit={createSegment} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-white/10 bg-slate-900 px-3 py-2" placeholder="Segment name" />
        <button className="rounded bg-blue-600 px-3 py-2">Create</button>
      </form>
      <div className="mt-4 space-y-2">
        {segments.map((segment) => (
          <div key={segment.id} className="rounded-lg border border-white/10 bg-slate-900 p-3">
            {segment.name} ({segment.type}) - {segment.clientCount} clients
          </div>
        ))}
      </div>
    </div>
  );
}
