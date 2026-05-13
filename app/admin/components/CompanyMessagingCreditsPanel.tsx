'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  adminApi,
  type ApiCreditBalanceResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { notifyBackofficeEvent } from '@/lib/notifications/client'

export type CompanyMessagingCreditsPanelProps = {
  companyId: number
  companyName: string
  /** Bump to reload balances from parent (e.g. after API client refresh on API Management). */
  refreshNonce?: number
  onAllocated?: () => void | Promise<void>
  /** When set, shows a link to API Management for keys and usage. */
  apiManagementHref?: string
}

export default function CompanyMessagingCreditsPanel({
  companyId,
  companyName,
  refreshNonce = 0,
  onAllocated,
  apiManagementHref,
}: CompanyMessagingCreditsPanelProps) {
  const { env } = useApiEnv()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [loadingCreditBalance, setLoadingCreditBalance] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [creditBalance, setCreditBalance] = useState<ApiCreditBalanceResponse | null>(null)
  const [allocationForm, setAllocationForm] = useState({
    smsCount: '0',
    emailCount: '0',
    whatsAppCount: '0',
    whatsAppUtilityCount: '0',
    notes: '',
    durationDays: '30',
  })

  const loadCreditBalance = useCallback(async (targetCompanyId: number) => {
    setLoadingCreditBalance(true)
    try {
      const balance = await adminApi.getCompanyApiCreditBalance(targetCompanyId)
      setCreditBalance(balance)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load messaging credit balance')
      setCreditBalance(null)
    } finally {
      setLoadingCreditBalance(false)
    }
  }, [])

  useEffect(() => {
    void loadCreditBalance(companyId)
  }, [companyId, env, refreshNonce, loadCreditBalance])

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()

    const smsCount = Number(allocationForm.smsCount || '0')
    const emailCount = Number(allocationForm.emailCount || '0')
    const whatsAppCount = Number(allocationForm.whatsAppCount || '0')
    const whatsAppUtilityCount = Number(allocationForm.whatsAppUtilityCount || '0')
    const durationDays =
      allocationForm.durationDays.trim() === ''
        ? undefined
        : Number(allocationForm.durationDays)

    const values = [smsCount, emailCount, whatsAppCount, whatsAppUtilityCount]
    if (values.some((x) => !Number.isFinite(x) || x < 0)) {
      toast.error('Counts must be zero or positive numbers')
      return
    }
    if (smsCount + emailCount + whatsAppCount + whatsAppUtilityCount <= 0) {
      toast.error('Allocate at least one message credit')
      return
    }
    if (durationDays !== undefined && (!Number.isFinite(durationDays) || durationDays <= 0)) {
      toast.error('Duration days must be a positive number')
      return
    }
    const confirmed = await confirm({
      title: 'Allocate messaging credits',
      description: `Add credits to ${companyName}?\n\nSMS: ${smsCount}\nEmail: ${emailCount}\nWhatsApp: ${whatsAppCount}\nWA Utility: ${whatsAppUtilityCount}`,
      confirmLabel: 'Allocate',
    })
    if (!confirmed) return

    setAllocating(true)
    try {
      await adminApi.allocateCompanyApiCredits(companyId, {
        smsCount,
        emailCount,
        whatsAppCount,
        whatsAppUtilityCount,
        notes: allocationForm.notes.trim() || undefined,
        durationDays,
      })
      await notifyBackofficeEvent('manual_credit_allocation', {
        companyId,
        companyName,
        amount: String(smsCount + emailCount + whatsAppCount + whatsAppUtilityCount),
      })
      toast.success('Credits allocated successfully')
      setAllocationForm({
        smsCount: '0',
        emailCount: '0',
        whatsAppCount: '0',
        whatsAppUtilityCount: '0',
        notes: '',
        durationDays: '30',
      })
      await loadCreditBalance(companyId)
      await onAllocated?.()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to allocate credits')
    } finally {
      setAllocating(false)
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-600">
        These balances apply to <strong>dashboard campaigns</strong> and{' '}
        <strong>API sends</strong> for this company. Requires backoffice permission{' '}
        <code className="rounded bg-slate-100 px-1 text-xs">api_credits.allocate</code>.
        {apiManagementHref ? (
          <>
            {' '}
            <Link
              href={apiManagementHref}
              className="font-medium text-[var(--admin-ui-accent)] hover:underline"
            >
              Open API Management
            </Link>{' '}
            for API keys and usage.
          </>
        ) : null}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          label="SMS balance"
          value={loadingCreditBalance ? '...' : String(creditBalance?.smsCount ?? 0)}
        />
        <StatCard
          label="Email balance"
          value={loadingCreditBalance ? '...' : String(creditBalance?.emailCount ?? 0)}
        />
        <StatCard
          label="WhatsApp balance"
          value={loadingCreditBalance ? '...' : String(creditBalance?.whatsAppCount ?? 0)}
        />
        <StatCard
          label="WA Utility balance"
          value={loadingCreditBalance ? '...' : String(creditBalance?.whatsAppUtilityCount ?? 0)}
        />
      </div>

      <form onSubmit={handleAllocate} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="SMS">
            <input
              type="number"
              min={0}
              value={allocationForm.smsCount}
              onChange={(e) => setAllocationForm((p) => ({ ...p, smsCount: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="Email">
            <input
              type="number"
              min={0}
              value={allocationForm.emailCount}
              onChange={(e) => setAllocationForm((p) => ({ ...p, emailCount: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="number"
              min={0}
              value={allocationForm.whatsAppCount}
              onChange={(e) =>
                setAllocationForm((p) => ({ ...p, whatsAppCount: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="WhatsApp Utility">
            <input
              type="number"
              min={0}
              value={allocationForm.whatsAppUtilityCount}
              onChange={(e) =>
                setAllocationForm((p) => ({ ...p, whatsAppUtilityCount: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        <Field label="Duration days (optional)">
          <input
            type="number"
            min={1}
            value={allocationForm.durationDays}
            onChange={(e) =>
              setAllocationForm((p) => ({ ...p, durationDays: e.target.value }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Notes (optional)">
          <input
            type="text"
            value={allocationForm.notes}
            onChange={(e) => setAllocationForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Invoice reference"
          />
        </Field>

        <button
          type="submit"
          disabled={allocating}
          className="rounded-lg bg-[var(--brand-color-1)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {allocating ? 'Allocating...' : 'Allocate credits'}
        </button>
      </form>
      {confirmDialog}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
