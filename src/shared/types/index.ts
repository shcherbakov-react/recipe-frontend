export type ApiError = {
  code: string
  message: string
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: ApiError
}

export type User = {
  id: string
  email: string | null
  username: string
  avatar_url: string | null
  is_email_verified: boolean
  is_active: boolean
  provider: 'email' | 'telegram' | 'yandex' | 'vk' | string
  created_at: string
  updated_at: string
}

export type TokenPair = {
  access_token: string
  refresh_token: string
}

export type AuthResponse = {
  user: User
  tokens: TokenPair
}

export type Recipe = {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Легко' | 'Средне' | 'Сложно'
  cookTime: number
  portions: number
  ingredients: string[]
  steps: string[]
  tags: string[]
  createdAt: string
}

export type View = 'recipes' | 'create' | 'auth' | 'profile' | 'security'
export type AuthMode = 'login' | 'register'
export type Notice = { type: 'success' | 'error' | 'info'; text: string }
export type BackendStatus = 'checking' | 'online' | 'offline'
