'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { Eye, EyeOff } from 'lucide-react'
import { getAdminBasePath } from '@/lib/adminNamespace'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { baseUrl } = useApiEnv()
  const basePath = getAdminBasePath(pathname)

  useEffect(() => {
    fetch('/api/admin/login')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push(`${basePath}/dashboard`)
        }
      })
  }, [basePath, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, apiBase: baseUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        // Full navigation so session cookies from the POST response are applied before middleware runs.
        window.location.assign(`${basePath}/dashboard`)
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" fixed top-0 left-0 w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-color-1)] via-[var(--brand-color-2)] to-[var(--brand-color-1)] px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[var(--brand-color-1)] mb-2">Backoffice Login</h1>
        <p className="text-gray-600 mb-4">Enter your credentials to access the dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-1)] focus:border-transparent outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-1)] focus:border-transparent outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-[var(--brand-color-1)] focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--brand-color-1)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--brand-color-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

