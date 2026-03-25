import { Suspense } from 'react'
import SmsProvidersClient from '@/app/admin/sms-providers/SmsProvidersClient'

export default function SmsProvidersPage() {
  return (
    <Suspense fallback={null}>
      <SmsProvidersClient />
    </Suspense>
  )
}

