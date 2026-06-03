import { getStoredTokens, storeTokens } from '../api/client'

export function readInitialTokens() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    const oauthTokens = { access_token: accessToken, refresh_token: refreshToken }
    storeTokens(oauthTokens)
    return oauthTokens
  }

  return getStoredTokens()
}

export function hasOAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  return Boolean(params.get('access_token') && params.get('refresh_token'))
}
