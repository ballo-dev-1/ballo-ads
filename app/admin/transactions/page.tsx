'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminApi, type TransactionResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

export default function TransactionsPage() {
  const { env } = useApiEnv()
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getTransactions({
        pageNumber: page,
        pageSize,
      })
      setTransactions(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [env, load])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">View payment transactions</p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
