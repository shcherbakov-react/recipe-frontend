import type { Category, CreateRecipeInput, Recipe, RecipeListResponse, Tag } from '../types'
import { http, unwrap } from './http'

export type RecipeListParams = {
  q?: string
  category_id?: string
  limit?: number
  offset?: number
}

export const recipesApi = {
  list: (params: RecipeListParams = {}) => unwrap<RecipeListResponse>(http.get('/api/v1/recipes', { params })),
  create: (input: CreateRecipeInput) => unwrap<Recipe>(http.post('/api/v1/recipes', input)),
  listTags: () => unwrap<Tag[]>(http.get('/api/v1/tags', { params: { limit: 100 } })),
  listCategories: () => unwrap<Category[]>(http.get('/api/v1/categories', { params: { limit: 100 } })),
}
