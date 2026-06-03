import type { TokenPair } from '../types'
import { TOKEN_KEY } from './config'

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
