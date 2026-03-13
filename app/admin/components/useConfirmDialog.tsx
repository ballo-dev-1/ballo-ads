import { useCallback, useEffect, useRef, useState } from 'react'

type ConfirmTone = 'default' | 'danger'

type ConfirmOptions = {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
}

type DialogState = (ConfirmOptions & { open: true }) | { open: false }

const CLOSED_STATE: DialogState = { open: false }

export function useConfirmDialog() {
  const [state, setState] = useState<DialogState>(CLOSED_STATE)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((confirmed: boolean) => {
    const resolver = resolverRef.current
    resolverRef.current = null
    setState(CLOSED_STATE)
    resolver?.(confirmed)
  }, [])

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false)
        resolverRef.current = null
      }
    }
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false)
      }
      resolverRef.current = resolve
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        tone: options.tone ?? 'default',
      })
    })
  }, [])

  const confirmDialog = state.open ? (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
            {state.title ?? 'Confirm action'}
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="whitespace-pre-wrap text-sm text-slate-700">{state.description}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {state.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors ${
              state.tone === 'danger'
                ? 'border border-red-700 bg-red-600 hover:bg-red-700'
                : 'border border-[var(--brand-color-2)] bg-[var(--brand-color-2)] hover:bg-[var(--brand-color-1)]'
            }`}
          >
            {state.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, confirmDialog }
}
