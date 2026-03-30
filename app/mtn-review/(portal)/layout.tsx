import MtnReviewShell from '@/app/mtn-review/components/MtnReviewShell'

export default function MtnReviewPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MtnReviewShell>{children}</MtnReviewShell>
}
