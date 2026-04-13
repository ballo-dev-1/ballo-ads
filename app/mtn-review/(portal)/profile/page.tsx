'use client'

import { useEffect, useState } from 'react'
import { LoadingCentered } from '@/app/components/LoadingSpinner'

type ReviewerProfile = {
  id: number
  firstName: string
  lastName: string
  email: string
  status: string
}

export default function MtnReviewProfilePage() {
  const [profile, setProfile] = useState<ReviewerProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    void fetch('/api/mtn-review/profile')
      .then(async (r) => {
        const data = (await r.json().catch(() => ({}))) as {
          error?: string
          reviewer?: ReviewerProfile
        }
        if (!r.ok) throw new Error(data.error || 'Failed to load profile')
        return data
      })
      .then((data) => {
        const reviewer = data.reviewer
        if (!reviewer) throw new Error('Reviewer profile unavailable')
        setProfile(reviewer)
        setFirstName(reviewer.firstName)
        setLastName(reviewer.lastName)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/mtn-review/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        reviewer?: ReviewerProfile
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      if (data.reviewer) {
        setProfile(data.reviewer)
        setFirstName(data.reviewer.firstName)
        setLastName(data.reviewer.lastName)
      }
      setSuccess('Profile updated.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingCentered minHeight={200} label="Loading profile" />
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your MTN reviewer account details.</p>
      </div>

      <form onSubmit={(e) => void save(e)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            value={profile?.email ?? ''}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
          />
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
