'use client'

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Announced to screen readers when provided */
  label?: string
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-12 w-12 border-2',
}

/** Shared spinner: works in admin shell and public pages (uses global brand color). */
export function LoadingSpinner({ size = 'md', className = '', label }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-slate-200 border-t-[var(--brand-color-3)] ${sizeClasses[size]} ${className}`.trim()}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-live={label ? 'polite' : undefined}
    />
  )
}

type LoadingCenteredProps = {
  minHeight?: string | number
  size?: LoadingSpinnerProps['size']
  label?: string
  className?: string
}

export function LoadingCentered({ minHeight = 200, size = 'lg', label, className = '' }: LoadingCenteredProps) {
  const style = typeof minHeight === 'number' ? { minHeight: `${minHeight}px` } : { minHeight }
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}
      style={style}
    >
      <LoadingSpinner size={size} label={label} />
    </div>
  )
}
