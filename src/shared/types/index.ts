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
  author_id: string
  category_id: string
  title: string
  description: string
  image_url: string | null
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  meal_type: string | null
  ingredients: RecipeIngredient[]
  instructions: RecipeStep[]
  source_url: string | null
  is_public: boolean
  category?: Category
  tags: Tag[]
  created_at: string
  updated_at: string
}

export type RecipeIngredient = {
  name: string
  amount?: string
  unit?: string
  notes?: string
  position?: number
}

export type RecipeStep = {
  text: string
  position?: number
}

export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type RecipeListResponse = {
  items: Recipe[]
  limit: number
  offset: number
  total: number
}

export type CreateRecipeInput = {
  category_id: string
  title: string
  description: string
  image_url?: string | null
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  difficulty: Recipe['difficulty']
  cuisine?: string | null
  meal_type?: string | null
  ingredients: RecipeIngredient[]
  instructions: RecipeStep[]
  source_url?: string | null
  is_public?: boolean
  tag_ids: string[]
}

export type View = 'recipes' | 'create' | 'auth' | 'profile' | 'security'
export type AuthMode = 'login' | 'register'
export type Notice = { type: 'success' | 'error' | 'info'; text: string }
export type BackendStatus = 'checking' | 'online' | 'offline'
