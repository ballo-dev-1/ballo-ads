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
  Pending: 'bg-gray-100 text-gray-700',
  InProgress: 'bg-blue-100 text-blue-700',
  PartiallyDone: 'bg-amber-100 text-amber-700',
  Done: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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
      <tr className="border-b border-gray-100">
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
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[feature.status]}`}
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
          <button className="mr-2 text-xs text-blue-600" onClick={() => onAddSubFeature(feature)}>Add Sub</button>
          <button className="mr-2 text-xs text-indigo-600" onClick={() => onEdit(feature)}>Edit</button>
          <button className="text-xs text-red-600" onClick={() => onDelete(feature)}>Delete</button>
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
