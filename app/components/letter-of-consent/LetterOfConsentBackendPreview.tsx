'use client'

import { useEffect, useState } from 'react'
import type { LetterPreviewRequestBody } from '@/lib/letterPreviewTypes'
import LetterHtmlDocument from '@/app/components/letter-of-consent/LetterHtmlDocument'

type Props = {
  payload: LetterPreviewRequestBody
  downloadFileNamePrefix?: string
  compact?: boolean
}

export default function LetterOfConsentBackendPreview({
  payload,
  downloadFileNamePrefix,
  compact,
}: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const key = JSON.stringify(payload)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setHtml(null)

    void fetch('/api/mtn-review/letter-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        const data = (await r.json().catch(() => ({}))) as {
          letterHtml?: string
          error?: string
        }
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
        if (typeof data.letterHtml !== 'string' || !data.letterHtml.trim()) {
          throw new Error('Empty letter from server')
        }
        return data.letterHtml
      })
      .then((h) => {
        if (!cancelled) setHtml(h)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load letter')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [key])

  if (loading) {
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600 ${compact ? '' : ''}`}>
        Generating letter preview on the server…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    )
  }

  if (!html) return null

  return (
    <LetterHtmlDocument
      html={html}
      fileNamePrefix={downloadFileNamePrefix}
      compact={compact}
    />
  )
}
