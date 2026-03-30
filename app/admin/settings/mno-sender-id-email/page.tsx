'use client'

import { useEffect, useState } from 'react'
import AdminHero from '@/app/admin/components/AdminHero'
import { adminApi, type PlatformSettingsUpdateRequest } from '@/lib/adminApi'
import toast from 'react-hot-toast'

export default function MnoSenderIdEmailSettingsPage() {
  const [primaryReplyTo, setPrimaryReplyTo] = useState('')
  const [secondaryReplyTo, setSecondaryReplyTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const settings = await adminApi.getPlatformSettings()
        if (cancelled) return
        setPrimaryReplyTo(settings.mnoSenderIdRequestReplyToEmailPrimary || '')
        setSecondaryReplyTo(settings.mnoSenderIdRequestReplyToEmailSecondary || '')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    const primary = primaryReplyTo.trim()
    const secondary = secondaryReplyTo.trim()
    if (!primary && !secondary) {
      setError('At least one reply-to email is required.')
      return
    }
    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    if (primary && !isValidEmail(primary)) {
      setError('Primary reply-to email is invalid.')
      return
    }
    if (secondary && !isValidEmail(secondary)) {
      setError('Secondary reply-to email is invalid.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload: PlatformSettingsUpdateRequest = {
        mnoSenderIdRequestReplyToEmailPrimary: primary,
        mnoSenderIdRequestReplyToEmailSecondary: secondary,
      }
      const updated = await adminApi.updatePlatformSettings(payload)
      setPrimaryReplyTo(updated.mnoSenderIdRequestReplyToEmailPrimary || '')
      setSecondaryReplyTo(updated.mnoSenderIdRequestReplyToEmailSecondary || '')
      toast.success('MNO sender-ID reply-to settings updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminHero
        title="MNO sender-ID email settings"
        description="Configure the default reply-to inboxes used when generated sender-ID approval letters are emailed to mobile network operators."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Loading settings...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="mno-reply-to-primary" className="text-sm font-medium text-slate-700">
                Primary reply-to email
              </label>
              <input
                id="mno-reply-to-primary"
                type="email"
                value={primaryReplyTo}
                onChange={(e) => {
                  setPrimaryReplyTo(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                placeholder="george.m@balloinnovations.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mno-reply-to-secondary" className="text-sm font-medium text-slate-700">
                Secondary reply-to email
              </label>
              <input
                id="mno-reply-to-secondary"
                type="email"
                value={secondaryReplyTo}
                onChange={(e) => {
                  setSecondaryReplyTo(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                placeholder="lombe.lusale@balloinnovations.com"
              />
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-color-1)] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
