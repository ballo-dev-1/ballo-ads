'use client'

import { useCallback, useRef } from 'react'
import { Printer } from 'lucide-react'

type Props = {
  html: string
  /** Tighter chrome for modals */
  compact?: boolean
}

export default function LetterHtmlDocument({ html, compact }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handlePrint = useCallback(() => {
    const iframe = iframeRef.current
    const win = iframe?.contentWindow
    const doc = iframe?.contentDocument
    if (!win || !doc) return

    const imgs = [...doc.images]
    const waitForImages = Promise.all(
      imgs.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true })
                img.addEventListener('error', () => resolve(), { once: true })
              }),
      ),
    )

    void waitForImages.then(() => {
      requestAnimationFrame(() => win.print())
    })
  }, [])

  const h = compact ? 'min-h-[280px]' : 'min-h-[480px]'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Letter of consent — preview
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>
      <div
        className={`overflow-hidden rounded-none border border-slate-200 bg-white shadow-none ${compact ? '' : 'mx-auto max-w-[210mm]'}`}
      >
        <iframe
          ref={iframeRef}
          title="Letter of consent"
          srcDoc={html}
          sandbox="allow-modals allow-same-origin"
          className={`${h} w-full border-0 bg-white`}
        />
      </div>
      <p className="text-[11px] text-slate-500">
        Preview is generated on the server. Use Print → &quot;Save as PDF&quot; for a PDF copy.
      </p>
    </div>
  )
}
