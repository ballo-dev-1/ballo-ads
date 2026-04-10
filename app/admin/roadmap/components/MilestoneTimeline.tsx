'use client'

import type { RoadmapMilestoneResponse } from '@/lib/adminApi'

type Props = {
  milestones: RoadmapMilestoneResponse[]
}

export default function MilestoneTimeline({ milestones }: Props) {
  if (!milestones.length) {
    return <p className="text-sm text-gray-500">No milestones yet.</p>
  }

  return (
    <div className="space-y-2">
      {milestones.map((m) => (
        <div key={m.id} className="rounded-lg border border-gray-100 p-2 text-sm">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                m.status === 'Reached'
                  ? 'bg-green-500'
                  : m.status === 'Missed'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
              }`}
            />
            <span className="font-medium text-gray-900">{m.title}</span>
            <span className="text-gray-500">
              target {new Date(m.targetDate).toLocaleDateString()}
            </span>
          </div>
          <p className="line-clamp-2 pt-1 text-xs italic text-gray-600" title={m.userStory}>
            {m.userStory}
          </p>
        </div>
      ))}
    </div>
  )
}
