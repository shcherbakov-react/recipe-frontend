import type { ApiResponse, AuthResponse, TokenPair, User } from './types'

export const API_URL = import.meta.env.VITE_API_URL ?? inferApiUrl()
const TOKEN_KEY = 'recipes.auth.tokens'

function inferApiUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080'
  }

  const hostname = window.location.hostname
  if (hostname === 'daloof.ru' || hostname === 'www.daloof.ru') {
    return 'https://api.daloof.ru'
  }

  return 'http://localhost:8080'
}

type RequestOptions = RequestInit & {
  auth?: boolean
  retry?: boolean
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

export function getStoredTokens(): TokenPair | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as TokenPair
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export function storeTokens(tokens: TokenPair | null) {
  if (!tokens) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }

  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const tokens = getStoredTokens()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (options.auth && tokens?.access_token) {
    headers.set('Authorization', `Bearer ${tokens.access_token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiClientError('Не удалось подключиться к API. Проверьте домен backend и CORS.', 'NETWORK_ERROR')
  }

  if (response.status === 401 && options.auth && options.retry !== false && tokens?.refresh_token) {
    const refreshed = await refreshTokens(tokens.refresh_token)
    storeTokens(refreshed)
    return request<T>(path, { ...options, retry: false })
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || payload?.success === false) {
    const message = payload?.error?.message ?? `HTTP ${response.status}`
    const code = payload?.error?.code ?? 'REQUEST_FAILED'
    throw new ApiClientError(message, code, response.status)
  }

  return payload?.data as T
}

const json = (value: unknown) => JSON.stringify(value)

export const api = {
  health: async () => {
    const response = await fetch(`${API_URL}/health`)
    if (!response.ok) throw new ApiClientError('Backend недоступен', 'HEALTH_FAILED', response.status)
    return response.text()
  },

  register: (input: { email: string; username: string; password: string }) =>
    request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: json(input),
    }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: json(input),
    }),

  me: () => request<User>('/api/v1/auth/me', { auth: true }),

  updateMe: (input: Partial<Pick<User, 'username' | 'email' | 'avatar_url'>>) =>
    request<User>('/api/v1/auth/me', {
      method: 'PUT',
      auth: true,
      body: json(input),
    }),

  refresh: (refreshToken: string) => refreshTokens(refreshToken),

  logout: (refreshToken: string) =>
    request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
      body: json({ refresh_token: refreshToken }),
    }),

  changePassword: (input: { old_password: string; new_password: string }) =>
    request<{ message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      auth: true,
      body: json(input),
    }),

  verifyEmail: (token: string) =>
    request<{ message: string }>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST',
    }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: json({ email }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: json({ email }),
    }),

  resetPassword: (input: { token: string; new_password: string }) =>
    request<{ message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: json(input),
    }),

  telegramAuthUrl: () => `${API_URL}/api/v1/auth/oauth/telegram`,
  yandexAuthUrl: () => `${API_URL}/api/v1/auth/oauth/yandex`,
  vkAuthUrl: () => `${API_URL}/api/v1/auth/oauth/vk`,
}

async function refreshTokens(refreshToken: string) {
  return request<TokenPair>('/api/v1/auth/refresh', {
    method: 'POST',
    retry: false,
    body: json({ refresh_token: refreshToken }),
  })
}
