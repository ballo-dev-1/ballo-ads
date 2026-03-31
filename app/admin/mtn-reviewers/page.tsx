'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getAdminBasePath } from '@/lib/adminNamespace'

export default function MtnReviewersPage() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const basePath = getAdminBasePath(pathname)
    router.replace(`${basePath}/sms-providers?mtnTab=reviewers`)
  }, [pathname, router])

  return null
}
