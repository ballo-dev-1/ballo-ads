'use client'

import type { RoadmapFeatureResponse, RoadmapFeatureStatus } from '@/lib/adminApi'

type Props = {
  feature: RoadmapFeatureResponse
  depth?: number
  onEdit: (feature: RoadmapFeatureResponse) => void
  onDelete: (feature: RoadmapFeatureResponse) => void
  onAddSubFeature: (feature: RoadmapFeatureResponse) => void
  onStatusChange: (feature: RoadmapFeatureResponse, status: RoadmapFeatureStatus) => void
}

const statusClass: Record<RoadmapFeatureStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-blue-100 text-blue-700',
  PartiallyDone: 'bg-amber-100 text-amber-700',
  Done: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
}

export default function FeatureRow({
  feature,
  depth = 0,
  onEdit,
  onDelete,
  onAddSubFeature,
  onStatusChange,
}: Props) {
  return (
    <>
      <tr className="border-b border-slate-100 transition hover:bg-slate-50/70">
        <td className="px-3 py-2">
          <div style={{ marginLeft: `${depth * 20}px` }} className="font-medium text-gray-900">
            {feature.name}
          </div>
          {feature.description ? (
            <p style={{ marginLeft: `${depth * 20}px` }} className="text-xs text-gray-500">
              {feature.description}
            </p>
          ) : null}
          <p
            style={{ marginLeft: `${depth * 20}px` }}
            className="line-clamp-2 text-xs italic text-gray-600"
            title={feature.userStory}
          >
            {feature.userStory}
          </p>
        </td>
        <td className="px-3 py-2 text-xs">{feature.priority}</td>
        <td className="px-3 py-2">
          <select
            className={`rounded-full border border-transparent px-3 py-1 text-xs font-medium transition focus:border-slate-300 focus:outline-none ${statusClass[feature.status]}`}
            value={feature.status}
            onChange={(e) => onStatusChange(feature, e.target.value as RoadmapFeatureStatus)}
          >
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="PartiallyDone">Partially Done</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </td>
        <td className="px-3 py-2 text-xs text-gray-600">
          {feature.plannedStartDate ? new Date(feature.plannedStartDate).toLocaleDateString() : '-'} -{' '}
          {feature.plannedEndDate ? new Date(feature.plannedEndDate).toLocaleDateString() : '-'}
        </td>
        <td className="px-3 py-2 text-right">
          <button
            className="mr-2 rounded-md px-1.5 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
            onClick={() => onAddSubFeature(feature)}
          >
            Add Sub
          </button>
          <button
            className="mr-2 rounded-md px-1.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
            onClick={() => onEdit(feature)}
          >
            Edit
          </button>
          <button
            className="rounded-md px-1.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            onClick={() => onDelete(feature)}
          >
            Delete
          </button>
        </td>
      </tr>
      {feature.subFeatures.map((child) => (
        <FeatureRow
          key={child.id}
          feature={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubFeature={onAddSubFeature}
          onStatusChange={onStatusChange}
        />
      ))}
    </>
  )
}
