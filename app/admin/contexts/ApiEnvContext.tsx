'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEV_API_BASE,
  PROD_API_BASE,
  getApiBaseUrl,
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

export function ApiEnvProvider({ children }: { children: ReactNode }) {
  const [env, setEnvState] = useState<ApiEnv>('dev')

  const baseUrl = env === 'prod' ? PROD_API_BASE : DEV_API_BASE

  useEffect(() => {
    setApiBaseUrl(baseUrl)
  }, [baseUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(API_ENV_STORAGE_KEY) as ApiEnv | null
    if (stored === 'dev' || stored === 'prod') {
      setEnvState(stored)
    } else {
      setEnvState(inferEnvFromUrl(getApiBaseUrl()))
    }
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
