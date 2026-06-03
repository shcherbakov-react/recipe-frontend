import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiResponse, TokenPair } from '../types'
import { API_URL } from './config'
import { getStoredTokens, storeTokens } from './tokens'

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
  skipAuth?: boolean
}

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(message: string, code = 'REQUEST_FAILED', status = 0) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

let refreshPromise: Promise<TokenPair> | null = null

http.interceptors.request.use((config) => {
  const requestConfig = config as RetryableRequestConfig
  const tokens = getStoredTokens()

  if (!requestConfig.skipAuth && tokens?.access_token) {
    config.headers.Authorization = `Bearer ${tokens.access_token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const requestConfig = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status ?? 0
    const tokens = getStoredTokens()

    if (status === 401 && requestConfig && !requestConfig._retry && !requestConfig.skipAuth && tokens?.refresh_token) {
      requestConfig._retry = true
      refreshPromise ??= refreshTokensRequest(tokens.refresh_token).finally(() => {
        refreshPromise = null
      })

      const refreshed = await refreshPromise
      storeTokens(refreshed)
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${refreshed.access_token}`,
      }

      return http(requestConfig)
    }

    throw toApiError(error)
  },
)

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise

  if (response.data.success === false || !('data' in response.data)) {
    throw new ApiClientError(response.data.error?.message ?? 'Пустой ответ API', response.data.error?.code)
  }

  return response.data.data as T
}

export function toApiError(error: unknown) {
  if (error instanceof ApiClientError) return error

  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    if (!error.response) {
      return new ApiClientError('Не удалось подключиться к API. Проверьте домен backend и CORS.', 'NETWORK_ERROR')
    }

    const payload = error.response.data
    return new ApiClientError(payload?.error?.message ?? `HTTP ${error.response.status}`, payload?.error?.code ?? 'REQUEST_FAILED', error.response.status)
  }

  return new ApiClientError('Неизвестная ошибка API')
}

async function refreshTokensRequest(refreshToken: string) {
  return unwrap<TokenPair>(
    http.post(
      '/api/v1/auth/refresh',
      { refresh_token: refreshToken },
      {
        skipAuth: true,
      } as RetryableRequestConfig,
    ),
  )
}
