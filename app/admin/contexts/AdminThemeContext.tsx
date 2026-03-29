'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AdminTheme = 'light' | 'dark'

type AdminThemeContextValue = {
  theme: AdminTheme
  setTheme: (t: AdminTheme) => void
  toggleTheme: () => void
  isDark: boolean
}

const STORAGE_KEY = 'ballo-admin-theme'

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)

function readStoredTheme(): AdminTheme {
  if (typeof window === 'undefined') return 'light'
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === 'dark' ? 'dark' : 'light'
}

export function AdminThemeProvider({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const [theme, setThemeState] = useState<AdminTheme>('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setThemeState(readStoredTheme())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme, hydrated])

  const setTheme = useCallback((t: AdminTheme) => setThemeState(t), [])
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
    }),
    [theme, setTheme, toggleTheme],
  )

  return (
    <AdminThemeContext.Provider value={value}>
      <div
        className={`admin-shell flex h-screen min-h-0 overflow-hidden antialiased ${className}`.trim()}
        data-admin-theme={theme}
        suppressHydrationWarning
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext)
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider')
  }
  return ctx
}
