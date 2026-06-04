import type { Category, CreateRecipeInput, Recipe, RecipeListResponse, Tag } from '../types'
import { http, unwrap } from './http'

export type RecipeListParams = {
  q?: string
  category_id?: string
  limit?: number
  offset?: number
  scope?: 'public' | 'available' | 'mine'
}

export const recipesApi = {
  list: ({ scope = 'public', ...params }: RecipeListParams = {}) => {
    const path = scope === 'mine' ? '/api/v1/recipes/my' : scope === 'available' ? '/api/v1/recipes/available' : '/api/v1/recipes'
    return unwrap<RecipeListResponse>(http.get(path, { params }))
  },
  random: (scope: 'public' | 'available' = 'public') =>
    unwrap<Recipe>(http.get(scope === 'available' ? '/api/v1/recipes/random/available' : '/api/v1/recipes/random')),
  create: (input: CreateRecipeInput) => unwrap<Recipe>(http.post('/api/v1/recipes', input)),
  listTags: () => unwrap<Tag[]>(http.get('/api/v1/tags', { params: { limit: 100 } })),
  listCategories: () => unwrap<Category[]>(http.get('/api/v1/categories', { params: { limit: 100 } })),
}
