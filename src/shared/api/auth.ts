import type { AxiosRequestConfig } from 'axios'
import type { AuthResponse, TokenPair, User } from '../types'
import { API_URL } from './config'
import { http, unwrap } from './http'

const skipAuth = { skipAuth: true } as AxiosRequestConfig & { skipAuth: true }

export const authApi = {
  health: async () => {
    const response = await http.get<string>('/health', {
      ...(skipAuth as AxiosRequestConfig),
      transformResponse: [(data) => data],
    })
    return response.data
  },

  register: (input: { email: string; username: string; password: string }) =>
    unwrap<AuthResponse>(http.post('/api/v1/auth/register', input, skipAuth)),

  login: (input: { email: string; password: string }) => unwrap<AuthResponse>(http.post('/api/v1/auth/login', input, skipAuth)),

  me: () => unwrap<User>(http.get('/api/v1/auth/me')),

  updateMe: (input: Partial<Pick<User, 'username' | 'email' | 'avatar_url'>>) => unwrap<User>(http.put('/api/v1/auth/me', input)),

  refresh: (refreshToken: string) => unwrap<TokenPair>(http.post('/api/v1/auth/refresh', { refresh_token: refreshToken }, skipAuth)),

  logout: (refreshToken: string) => unwrap<{ message: string }>(http.post('/api/v1/auth/logout', { refresh_token: refreshToken }, skipAuth)),

  changePassword: (input: { old_password: string; new_password: string }) => unwrap<{ message: string }>(http.post('/api/v1/auth/change-password', input)),

  verifyEmail: (token: string) => unwrap<{ message: string }>(http.post(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, undefined, skipAuth)),

  resendVerification: (email: string) => unwrap<{ message: string }>(http.post('/api/v1/auth/resend-verification', { email }, skipAuth)),

  forgotPassword: (email: string) => unwrap<{ message: string }>(http.post('/api/v1/auth/forgot-password', { email }, skipAuth)),

  resetPassword: (input: { token: string; new_password: string }) => unwrap<{ message: string }>(http.post('/api/v1/auth/reset-password', input, skipAuth)),

  telegramAuthUrl: () => `${API_URL}/api/v1/auth/oauth/telegram`,
  yandexAuthUrl: () => `${API_URL}/api/v1/auth/oauth/yandex`,
  vkAuthUrl: () => `${API_URL}/api/v1/auth/oauth/vk`,
}
