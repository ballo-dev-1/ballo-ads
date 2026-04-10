'use client'

import { useState } from 'react'
import type {
  RoadmapFeaturePriority,
  RoadmapFeatureRequest,
  RoadmapMilestoneRequest,
  RoadmapPhaseRequest,
} from '@/lib/adminApi'

type Props = {
  mode: 'phase' | 'feature' | 'milestone' | null
  title: string
  onClose: () => void
  onSubmitPhase: (payload: RoadmapPhaseRequest) => Promise<void>
  onSubmitFeature: (payload: RoadmapFeatureRequest) => Promise<void>
  onSubmitMilestone: (payload: RoadmapMilestoneRequest) => Promise<void>
  featureParentId?: number
}

export default function RoadmapFormModals({
  mode,
  title,
  onClose,
  onSubmitPhase,
  onSubmitFeature,
  onSubmitMilestone,
  featureParentId,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [userStory, setUserStory] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState<RoadmapFeaturePriority>('Medium')

  if (!mode) return null

  const submit = async () => {
    if (mode !== 'phase' && !userStory.trim()) return
    if (mode === 'phase') {
      await onSubmitPhase({ name, description })
    } else if (mode === 'feature') {
      await onSubmitFeature({ name, userStory: userStory.trim(), description, priority, parentFeatureId: featureParentId })
    } else {
      await onSubmitMilestone({ title: name, userStory: userStory.trim(), description, targetDate })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-3 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === 'milestone' ? 'Title' : 'Name'}
            className="w-full rounded-lg border px-3 py-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full rounded-lg border px-3 py-2"
          />
          {mode !== 'phase' ? (
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="User story (required): As a <role>, I want <goal>, so that <outcome>."
              className="w-full rounded-lg border px-3 py-2"
              required
            />
          ) : null}
          {mode === 'feature' ? (
            <select value={priority} onChange={(e) => setPriority(e.target.value as RoadmapFeaturePriority)} className="w-full rounded-lg border px-3 py-2">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          ) : null}
          {mode === 'milestone' ? (
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          ) : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
          <button
            onClick={submit}
            disabled={mode !== 'phase' && !userStory.trim()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
