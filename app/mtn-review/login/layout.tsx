import { Suspense } from 'react'
import { LoadingCentered } from '@/app/components/LoadingSpinner'

export default function MtnReviewLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingCentered minHeight="50vh" label="Loading page" />}>
      {children}
    </Suspense>
  )
}
