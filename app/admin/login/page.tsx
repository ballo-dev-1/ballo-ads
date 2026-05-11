'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Globe, Server, Lock, Mail, Loader2, AlertCircle, ChevronDown, Check } from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'
import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from '@/lib/adminApi'

const API_PRESETS = [
  { label: 'Production', value: PROD_API_BASE, icon: Globe },
  { label: 'Staging', value: STAGING_API_BASE, icon: Server },
  { label: 'Development', value: DEV_API_BASE, icon: Lock },
  { label: 'Local (5238)', value: 'http://localhost:5238', icon: Server },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiBase, setApiBase] = useState(PROD_API_BASE)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPresets, setShowPresets] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If the URL has an 'env' hint, pre-select the preset
    const envHint = searchParams.get('env')
    if (envHint === 'dev') setApiBase(DEV_API_BASE)
    else if (envHint === 'staging') setApiBase(STAGING_API_BASE)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, apiBase }),
      })

      const data = await res.json()

      if (res.ok) {
        // Find which namespace we are in to redirect correctly
        const pathname = window.location.pathname
        const basePath = pathname.startsWith('/dev-admin') ? '/dev-admin' :
                         pathname.startsWith('/staging-admin') ? '/staging-admin' : '/admin'
        router.push(`${basePath}/dashboard`)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentPreset = API_PRESETS.find(p => p.value.replace(/\/+$/, '') === apiBase.replace(/\/+$/, ''))

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050a] px-4 font-sans selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[10%] h-[30%] w-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Image src={logo_1} alt="Ballo" className="h-10 w-auto brightness-0 invert" priority />
            <Image src={logo_2} alt="Ballo Ads" className="h-9 w-auto brightness-0 invert" priority />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-400">Admin Control Panel Authentication</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Backend Environment
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    {currentPreset ? <currentPreset.icon className="h-4 w-4 text-blue-400" /> : <Server className="h-4 w-4 text-gray-400" />}
                    <span>{currentPreset?.label || 'Custom Endpoint'}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                </button>

                {showPresets && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#161622] shadow-2xl backdrop-blur-xl">
                    {API_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setApiBase(preset.value)
                          setShowPresets(false)
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <div className="flex items-center gap-3">
                          <preset.icon className="h-4 w-4" />
                          <span>{preset.label}</span>
                        </div>
                        {apiBase === preset.value && <Check className="h-4 w-4 text-blue-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white placeholder:text-gray-600 transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 transition-colors hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex animate-in fade-in slide-in-from-top-1 items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="relative flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Secure Administrative Access &copy; {new Date().getFullYear()} BalloAds
        </p>
      </div>
    </div>
  )
}
