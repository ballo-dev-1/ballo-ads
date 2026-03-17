'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  DEV_API_BASE,
  PROD_API_BASE,
  STAGING_API_BASE,
  registerBaseUrlGetter,
  setApiBaseUrl,
} from '@/lib/adminApi'
import { getAdminEnvFromPathname } from '@/lib/adminNamespace'

export const API_ENV_STORAGE_KEY = 'ballo-ads-api-env'

export type ApiEnv = 'dev' | 'staging' | 'prod'

type ApiEnvContextValue = {
  env: ApiEnv
  baseUrl: string
  setEnv: (env: ApiEnv) => void
}

const ApiEnvContext = createContext<ApiEnvContextValue | null>(null)

export function useApiEnv(): ApiEnvContextValue {
  const ctx = useContext(ApiEnvContext)
  if (!ctx) throw new Error('useApiEnv must be used within ApiEnvProvider')
  return ctx
}

function getInitialEnv(): ApiEnv {
  if (typeof window === 'undefined') return 'prod'
  return getAdminEnvFromPathname(window.location.pathname)
}

export function ApiEnvProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [env, setEnvState] = useState<ApiEnv>(getInitialEnv)

  const baseUrl =
    env === 'prod' ? PROD_API_BASE : env === 'staging' ? STAGING_API_BASE : DEV_API_BASE

  // Update getter and module variable synchronously before children run (so refetch after env switch uses correct URL)
  useLayoutEffect(() => {
    registerBaseUrlGetter(() => baseUrl)
    setApiBaseUrl(baseUrl)
  }, [baseUrl])

  useEffect(() => {
    if (!pathname) return
    setEnvState(getAdminEnvFromPathname(pathname))
  }, [pathname])

  const setEnv = () => {
    // Environment is derived from route namespace and is not directly mutable.
  }

  return (
    <ApiEnvContext.Provider value={{ env, baseUrl, setEnv }}>
      {children}
    </ApiEnvContext.Provider>
  )
}
