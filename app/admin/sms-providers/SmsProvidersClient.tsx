'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { adminApi, type TumaniBalanceResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'
import MtnWhitelistedSenderIdsPanel from '@/app/admin/components/MtnWhitelistedSenderIdsPanel'

type SmsProviderTab = 'tumani' | 'mtn'
type MtnInnerTab = 'whitelisted'

export default function SmsProvidersClient() {
  const { env } = useApiEnv()
  const [activeTab, setActiveTab] = useState<SmsProviderTab>('tumani')
  const searchParams = useSearchParams()

  const [loadingTumani, setLoadingTumani] = useState(false)
  const [tumaniError, setTumaniError] = useState('')
  const [tumaniBalance, setTumaniBalance] = useState<TumaniBalanceResponse | null>(null)

  const [activeMtnInnerTab, setActiveMtnInnerTab] = useState<MtnInnerTab>('whitelisted')

  const loadTumani = useCallback(async () => {
    setLoadingTumani(true)
    setTumaniError('')
    try {
      const res = await adminApi.getTumaniBalance()
      setTumaniBalance(res)
    } catch (e: unknown) {
      setTumaniBalance(null)
      setTumaniError(e instanceof Error ? e.message : 'Failed to load Tumani balance')
    } finally {
      setLoadingTumani(false)
    }
  }, [])

  useEffect(() => {
    const mtnTab = searchParams.get('mtnTab')
    if (mtnTab === 'whitelisted') {
      setActiveTab('mtn')
      setActiveMtnInnerTab('whitelisted')
      return
    }
  }, [searchParams])

  useEffect(() => {
    if (activeTab !== 'tumani') return
    void loadTumani()
  }, [env, activeTab, loadTumani])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AdminHero
          eyebrow="SMS providers"
          title="SMS Providers"
          description="View balances and operational status for SMS sending providers."
          variant="sky"
        />

        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tumani')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'tumani'
                ? 'bg-[#0e0e39] text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tumani
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mtn')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'mtn'
                ? 'bg-[#0e0e39] text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            MTN
          </button>
        </div>

        {activeTab === 'tumani' ? (
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Tumani balance</h2>

            {loadingTumani ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
              </div>
            ) : tumaniError ? (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {tumaniError}
              </div>
            ) : tumaniBalance ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Holder ID</p>
                  <p className="mt-1 font-mono text-sm text-gray-900 break-all">{tumaniBalance.holderId}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Balance</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{tumaniBalance.balance}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No Tumani balance data yet.</div>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">MTN provider</h2>
              <p className="text-sm text-gray-600">Operational controls and backup views for MTN.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMtnInnerTab('whitelisted')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeMtnInnerTab === 'whitelisted'
                    ? 'bg-[#0e0e39] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Whitelisted sender IDs
              </button>
            </div>

            {activeMtnInnerTab === 'whitelisted' ? (
              <MtnWhitelistedSenderIdsPanel />
            ) : null}
          </section>
        )}
      </div>
    </div>
  )
}

