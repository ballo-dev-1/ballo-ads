'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getAdminBasePath } from '@/lib/adminNamespace'
import AdminHero from '@/app/admin/components/AdminHero'
import CompanyAnalyticsPanel from '@/app/admin/companies/[id]/components/CompanyAnalyticsPanel'

export default function CompanyAnalyticsPage() {
  const params = useParams()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const idParam = params.id
  const numericId = idParam != null ? Number(idParam) : NaN
  const invalidId = typeof idParam !== 'string' || idParam === '' || Number.isNaN(numericId)

  const breadcrumb = (
    <div className="mb-6 flex flex-wrap items-center gap-1 text-xs text-white/80">
      <Link href={`${basePath}/companies`} className="hover:text-white hover:underline">
        Companies
      </Link>
      <span>/</span>
      <Link href={`${basePath}/companies/${numericId}`} className="hover:text-white hover:underline">
        {`Company ${numericId}`}
      </Link>
      <span>/</span>
      <span>Analytics</span>
    </div>
  )

  if (invalidId) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            Invalid company ID
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <AdminHero
            topSlot={breadcrumb}
            eyebrow="Company analytics"
            title={`Company ${numericId} analytics`}
            description="Company-scoped campaign, revenue, and moderation analytics."
            variant="blue"
            actions={
              <Link
                href={`${basePath}/companies/${numericId}`}
                className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Back to company
              </Link>
            }
          />

          <CompanyAnalyticsPanel companyId={numericId} />
        </div>
      </div>
    </div>
  )
}
