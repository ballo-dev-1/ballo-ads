'use client'

import type { RoadmapMilestoneResponse } from '@/lib/adminApi'

type Props = {
  milestones: RoadmapMilestoneResponse[]
}

export default function MilestoneTimeline({ milestones }: Props) {
  if (!milestones.length) {
    return <p className="text-sm text-slate-500">No milestones yet.</p>
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {milestones.map((m, index) => (
        <div
          key={m.id}
          className={`relative rounded-2xl border border-white/80 p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
          }`}
        >
          <div
            className={`absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-white ${
              m.status === 'Reached'
                ? 'bg-emerald-500'
                : m.status === 'Missed'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
            }`}
          />
          <div className="pt-3">
            <span className="font-medium text-slate-900">{m.title}</span>
            <span className="ml-2 text-slate-500">target {new Date(m.targetDate).toLocaleDateString()}</span>
          </div>
          <p className="line-clamp-2 pt-1 text-xs italic text-slate-600" title={m.userStory}>
            {m.userStory}
          </p>
        </div>
      ))}
    </div>
  )
}
