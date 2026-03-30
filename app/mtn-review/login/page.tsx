'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MtnReviewLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void fetch('/api/mtn-review/session')
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) {
          const ret = searchParams.get('return')
          router.replace(ret && ret.startsWith('/mtn-review') ? ret : '/mtn-review')
        }
      })
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/mtn-review/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Login failed')
        return
      }
      const ret = searchParams.get('return')
      router.push(ret && ret.startsWith('/mtn-review') ? ret : '/mtn-review')
      router.refresh()
    } catch {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">MTN review portal</h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo: use any non-empty username and password.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="mtn-user" className="mb-1.5 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="mtn-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="mtn-pass" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="mtn-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
