'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function MtnReviewSignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mtn-review/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Signup failed')
        return
      }

      setSuccessMessage(
        typeof data.message === 'string'
          ? data.message
          : 'Account created. Awaiting approval.',
      )
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => router.push('/mtn-review/login'), 1800)
    } catch {
      setError('Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Create MTN reviewer account</h1>
        <p className="mt-1 text-sm text-slate-600">
          New accounts require backoffice approval before login.
        </p>

        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-first-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              id="signup-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-last-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              id="signup-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              autoComplete="family-name"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 hover:text-slate-700"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          {successMessage ? (
            <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          Already have approval?{' '}
          <Link href="/mtn-review/login" className="font-semibold text-sky-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
