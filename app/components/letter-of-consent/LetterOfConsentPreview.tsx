'use client'

import { Download } from 'lucide-react'
import type { LetterOfConsentModel } from '@/lib/mtnLetterOfConsent'
import { downloadLetterOfConsentPdf } from '@/lib/mtnLetterOfConsent'

type Props = {
  model: LetterOfConsentModel
  /** Prefix for PDF filename (e.g. company id or submission id) */
  downloadFileNamePrefix?: string
  /** Slightly tighter layout for modals */
  compact?: boolean
  /** When true, shows a short note while AI sample messages are loading */
  samplesLoading?: boolean
}

const letterFont = { fontFamily: '"Times New Roman", Times, serif' } as const

export default function LetterOfConsentPreview({
  model,
  downloadFileNamePrefix,
  compact,
  samplesLoading,
}: Props) {
  const outerPad = compact ? 'py-6 px-5' : 'py-10 px-[22mm]'

  const contactLines: string[] = []
  if (model.addressLine && model.addressLine !== '—') {
    contactLines.push(model.addressLine)
  }
  if (model.phone && model.phone !== '—') {
    contactLines.push(`Phone / WhatsApp: ${model.phone}`)
  }
  if (model.website && model.website !== '—') {
    contactLines.push(`Website: ${model.website}`)
  }
  if (model.email && model.email !== '—') {
    contactLines.push(`Email: ${model.email}`)
  }
  if (contactLines.length === 0) {
    contactLines.push('—')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Letter of consent — preview
        </p>
        <button
          type="button"
          onClick={() => downloadLetterOfConsentPdf(model, downloadFileNamePrefix)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download as PDF
        </button>
      </div>
      <div
        id="letter-of-consent-preview"
        className={`${outerPad} mx-auto max-w-[210mm] rounded-none border border-slate-200 bg-white text-black shadow-none`}
        style={letterFont}
      >
        {/* Full width within side margins — mirrors PDF content area */}
        <div className="w-full text-[11pt] leading-normal">
          <header className="text-center">
            <h1 className="text-[17pt] font-bold uppercase leading-tight tracking-wide">
              {model.companyNameUpper}
            </h1>
            <p className="mt-2 text-[11pt] font-normal leading-snug">{model.tagline}</p>
            <div className="mx-auto mt-5 max-w-[95mm] space-y-1 text-center text-[11pt] leading-snug">
              {contactLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </header>

          <div className="mt-6 border-b border-[rgb(226,232,240)]" />

          <p className="mt-[8mm] text-[11pt]">Date: {model.dateStr}</p>

          <address className="mt-[8mm] not-italic">
            {model.recipientLines.map((line) => (
              <p key={line} className="text-[11pt] leading-[1.35]">
                {line}
              </p>
            ))}
          </address>

          <p className="mt-[6mm] text-[11pt] font-bold">Re: LETTER OF CONSENT</p>

          <p className="mt-[9mm] max-w-[118mm] text-[11pt] leading-[1.5]">{model.bodyParagraph}</p>

          {samplesLoading ? (
            <p className="mt-4 text-[10pt] text-slate-600">Generating sample SMS messages…</p>
          ) : null}

          <div className="mt-[7mm] w-full text-[10pt]">
            {/*
              Class letter-of-consent-doc-table: global CSS resets admin-shell table
              styles (rounded row cards) so the grid matches the PDF.
            */}
            <table className="letter-of-consent-doc-table w-full">
              <colgroup>
                <col style={{ width: '38mm' }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Sender ID</th>
                  <th scope="col">SMS Content Sample</th>
                </tr>
              </thead>
              <tbody>
                {(model.smsSamples.length ? model.smsSamples : ['—']).map((sample, idx) => (
                  <tr key={`${idx}-${sample.slice(0, 24)}`}>
                    <td>{model.senderId || '—'}</td>
                    <td>{sample}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-[14mm] text-[11pt] leading-snug">
            <p>Thank you for your co-operation</p>
            <p className="mt-[7mm]">Yours faithfully</p>
            <div className="mt-[16mm] space-y-[5.5mm]">
              <p className="font-normal">{model.signatoryName}</p>
              <p className="font-normal">{model.signingEntity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
