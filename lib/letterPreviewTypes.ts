/** Body for POST /api/mtn-review/letter-preview → backend internal/mtn-review/letter-preview */
export type LetterPreviewRequestBody = {
  companyId: number
  companyName?: string
  senderId?: string
  networks?: string[]
  physicalAddress?: string
  phoneNumber?: string
  email?: string
  websiteUrl?: string
  description?: string
  industry?: string
  submittedAt?: string
}

export type LetterPreviewResponse = {
  letterHtml: string
  authorizedSignatoryName?: string | null
  letterSmsSamples?: string[]
}
