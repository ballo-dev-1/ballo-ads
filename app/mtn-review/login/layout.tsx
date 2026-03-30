import { Suspense } from 'react'

export default function MtnReviewLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-600">Loading…</div>
      }
    >
      {children}
    </Suspense>
  )
}
