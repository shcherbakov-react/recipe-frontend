import type { Recipe } from '../../../shared/types'
import { starterRecipes } from './mock'

export const recipeStorageKey = 'recipes.local.items'

export function loadRecipes() {
  const raw = localStorage.getItem(recipeStorageKey)
  if (!raw) return starterRecipes

  try {
    const parsed = JSON.parse(raw) as Recipe[]
    return Array.isArray(parsed) ? parsed : starterRecipes
  } catch {
    return starterRecipes
  }
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(recipeStorageKey, JSON.stringify(recipes))
}
