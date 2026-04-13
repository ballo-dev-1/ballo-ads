'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminApi, type TransactionResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'

export default function TransactionsPage() {
  const { env } = useApiEnv()
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(true)
  const [walletBalanceError, setWalletBalanceError] = useState('')
  const [canViewWalletBalance, setCanViewWalletBalance] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setWalletBalanceLoading(true)
    setWalletBalanceError('')
    try {
      const [transactionsResult, walletBalanceResult] = await Promise.allSettled([
        adminApi.getTransactions({
          pageNumber: page,
          pageSize,
        }),
        adminApi.getTransactionsWalletBalance(),
      ])

      if (transactionsResult.status === 'rejected') {
        throw transactionsResult.reason
      }

      const data = transactionsResult.value
      setTransactions(Array.isArray(data) ? data : [])

      if (walletBalanceResult.status === 'fulfilled') {
        setCanViewWalletBalance(true)
        setWalletBalance(walletBalanceResult.value.balance ?? 0)
      } else {
        const walletError = walletBalanceResult.reason as { status?: number; message?: string }
        if (walletError?.status === 403 || walletError?.status === 404) {
          setCanViewWalletBalance(false)
          setWalletBalance(null)
        } else {
          setCanViewWalletBalance(true)
          setWalletBalance(null)
          setWalletBalanceError(walletError?.message ?? 'Failed to load wallet balance')
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
      setWalletBalanceLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [env, load])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow="Billing"
          title="Transactions"
          description="View payment transactions."
          variant="slate"
          actions={
            canViewWalletBalance ? (
              <div className="rounded-full bg-[var(--brand-color-1)] px-5 py-3 text-white shadow-lg">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
                  Lipila wallet balance
                </div>
                {walletBalanceLoading ? (
                  <div className="mt-1 flex items-center gap-2" role="status" aria-label="Loading wallet balance">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : walletBalanceError ? (
                  <div className="mt-0.5 text-sm font-semibold text-red-300">Unavailable</div>
                ) : (
                  <div className="mt-0.5 text-sm font-semibold">
                    ZMW{' '}
                    {walletBalance?.toLocaleString(undefined, {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    }) ?? '0.000'}
                  </div>
                )}
              </div>
            ) : null
          }
        />

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto bg-transparent p-4">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Payment method</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100">
                        <td className="py-3 px-5 font-medium text-gray-900">{tx.id}</td>
                        <td className="py-3 px-5 text-sm text-gray-700 font-mono">{tx.transactionId ?? '—'}</td>
                        <td className="py-3 px-5 text-gray-700">
                          {tx.currency ?? ''} {tx.amount}
                        </td>
                        <td className="py-3 px-5">
                          <span className="text-gray-700">{tx.status ?? '—'}</span>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600">{tx.paymentMethod ?? '—'}</td>
                        <td className="py-3 px-5 text-sm text-gray-600">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm text-gray-600 hover:underline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={transactions.length < pageSize}
                className="text-sm text-gray-600 hover:underline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
