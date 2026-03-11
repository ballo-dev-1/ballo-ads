'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEV_API_BASE,
  PROD_API_BASE,
  registerBaseUrlGetter,
  setApiBaseUrl,
} from '@/lib/adminApi'

export const API_ENV_STORAGE_KEY = 'ballo-ads-api-env'

export type ApiEnv = 'dev' | 'prod'

type ApiEnvContextValue = {
  env: ApiEnv
  baseUrl: string
  setEnv: (env: ApiEnv) => void
}

const ApiEnvContext = createContext<ApiEnvContextValue | null>(null)

function inferEnvFromUrl(url: string): ApiEnv {
  return url.replace(/\/+$/, '') === PROD_API_BASE ? 'prod' : 'dev'
}

export function useApiEnv(): ApiEnvContextValue {
  const ctx = useContext(ApiEnvContext)
  if (!ctx) throw new Error('useApiEnv must be used within ApiEnvProvider')
  return ctx
}

function getInitialEnv(): ApiEnv {
  if (typeof window === 'undefined') return 'dev'
  const stored = localStorage.getItem(API_ENV_STORAGE_KEY) as ApiEnv | null
  if (stored === 'dev' || stored === 'prod') return stored
  const isProductionSite =
    window.location.hostname === 'www.balloads.com' ||
    window.location.hostname === 'balloads.com'
  return isProductionSite ? 'prod' : 'dev'
}

export function ApiEnvProvider({ children }: { children: ReactNode }) {
  const [env, setEnvState] = useState<ApiEnv>(getInitialEnv)

  const baseUrl = env === 'prod' ? PROD_API_BASE : DEV_API_BASE

  // Update getter and module variable synchronously before children run (so refetch after env switch uses correct URL)
  useLayoutEffect(() => {
    registerBaseUrlGetter(() => baseUrl)
    setApiBaseUrl(baseUrl)
  }, [baseUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setEnvState(getInitialEnv())
  }, [])

  const setEnv = useCallback((newEnv: ApiEnv) => {
    localStorage.setItem(API_ENV_STORAGE_KEY, newEnv)
    setApiBaseUrl(newEnv === 'prod' ? PROD_API_BASE : DEV_API_BASE)
    setEnvState(newEnv)
  }, [])

  return (
    <ApiEnvContext.Provider value={{ env, baseUrl, setEnv }}>
      {children}
    </ApiEnvContext.Provider>
  )
}
