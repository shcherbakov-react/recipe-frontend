import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { loadRecipes, saveRecipes } from '../entities/recipe/model/storage'
import { AuthView } from '../features/auth/ui/AuthView'
import { CreateRecipeView } from '../features/create-recipe/ui/CreateRecipeView'
import { ProfileView } from '../features/profile/ui/ProfileView'
import { SecurityView } from '../features/security/ui/SecurityView'
import { RecipesPage } from '../pages/recipes/ui/RecipesPage'
import {
  queryKeys,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useHealthQuery,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useRegisterMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useUpdateMeMutation,
  useVerifyEmailMutation,
} from '../shared/api/queries'
import { storeTokens } from '../shared/api/tokens'
import { hasOAuthCallback, readInitialTokens } from '../shared/lib/auth'
import { toNotice } from '../shared/lib/notice'
import type { AuthMode, AuthResponse, Notice, Recipe, TokenPair, User, View } from '../shared/types'
import { NoticeBanner } from '../shared/ui/NoticeBanner/NoticeBanner'
import { AppHeader } from '../widgets/app-header/ui/AppHeader'
import { BottomNavbar } from '../widgets/bottom-navbar/ui/BottomNavbar'
import { StatusSidebar } from '../widgets/status-sidebar/ui/StatusSidebar'
import styles from './App.module.css'

export function App() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<View>('recipes')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<TokenPair | null>(() => readInitialTokens())
  const [notice, setNotice] = useState<Notice | null>(() =>
    hasOAuthCallback() ? { type: 'success', text: 'Авторизация через OAuth завершена.' } : null,
  )
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const healthQuery = useHealthQuery()
  const meQuery = useMeQuery(Boolean(tokens))
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()
  const updateMeMutation = useUpdateMeMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const verifyEmailMutation = useVerifyEmailMutation()
  const resendVerificationMutation = useResendVerificationMutation()
  const forgotPasswordMutation = useForgotPasswordMutation()
  const resetPasswordMutation = useResetPasswordMutation()

  const loading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    updateMeMutation.isPending ||
    changePasswordMutation.isPending ||
    verifyEmailMutation.isPending ||
    resendVerificationMutation.isPending ||
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending
  const currentUser = user ?? meQuery.data ?? null
  const backendStatus = healthQuery.isPending ? 'checking' : healthQuery.isError ? 'offline' : 'online'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    if (!meQuery.error) return

    const timeout = window.setTimeout(() => {
      setNotice(toNotice(meQuery.error))
      storeTokens(null)
      setTokens(null)
      setUser(null)
      queryClient.removeQueries({ queryKey: queryKeys.me })
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [meQuery.error, queryClient])

  useEffect(() => {
    saveRecipes(recipes)
  }, [recipes])

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(recipes.map((recipe) => recipe.category))).sort()],
    [recipes],
  )

  const visibleRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return recipes.filter((recipe) => {
      const matchesCategory = category === 'Все' || recipe.category === category
      const searchable = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        recipe.ingredients.join(' '),
        recipe.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return matchesCategory && (!normalized || searchable.includes(normalized))
    })
  }, [category, query, recipes])

  const applyAuth = (response: AuthResponse) => {
    storeTokens(response.tokens)
    setTokens(response.tokens)
    setUser(response.user)
    queryClient.setQueryData(queryKeys.me, response.user)
    setView('recipes')
    setNotice({ type: 'success', text: `Вы вошли как ${response.user.username}` })
  }

  const logout = async () => {
    const refreshToken = tokens?.refresh_token
    storeTokens(null)
    setTokens(null)
    setUser(null)
    queryClient.removeQueries({ queryKey: queryKeys.me })
    setView('auth')

    if (refreshToken) {
      logoutMutation.mutate(refreshToken)
    }
  }

  const guardedSetView = (nextView: View) => {
    if ((nextView === 'profile' || nextView === 'security') && !currentUser) {
      setView('auth')
      setNotice({ type: 'info', text: 'Войдите, чтобы пользоваться этим разделом.' })
      return
    }

    setView(nextView)
  }

  return (
    <main className={styles.app}>
      <div className={styles.container}>
        <AppHeader currentView={view} isAuthenticated={Boolean(currentUser)} onLogout={logout} onNavigate={guardedSetView} />

        <section className={styles.content}>
          <div className={styles.main}>
            {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

            {view === 'recipes' && (
              <RecipesPage
                backendStatus={backendStatus}
                category={category}
                categories={categories}
                onCategoryChange={setCategory}
                onCreate={() => guardedSetView('create')}
                query={query}
                recipes={visibleRecipes}
                setQuery={setQuery}
                total={recipes.length}
              />
            )}

            {view === 'create' && (
              <CreateRecipeView
                onCreate={(recipe) => {
                  setRecipes((current) => [recipe, ...current])
                  setView('recipes')
                  setNotice({ type: 'success', text: 'Рецепт создан локально. Backend-ручку можно подключить через query-хук.' })
                }}
              />
            )}

            {view === 'auth' && (
              <AuthView
                loading={loading}
                mode={authMode}
                onModeChange={setAuthMode}
                onSubmit={async (data) => {
                  try {
                    const response =
                      authMode === 'login'
                        ? await loginMutation.mutateAsync({ email: data.email, password: data.password })
                        : await registerMutation.mutateAsync({
                            email: data.email,
                            username: data.username,
                            password: data.password,
                          })
                    applyAuth(response)
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
              />
            )}

            {view === 'profile' && currentUser && (
              <ProfileView
                user={currentUser}
                onSubmit={async (updates) => {
                  try {
                    const updated = await updateMeMutation.mutateAsync(updates)
                    setUser(updated)
                    queryClient.setQueryData(queryKeys.me, updated)
                    setNotice({ type: 'success', text: 'Профиль обновлен.' })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
              />
            )}

            {view === 'security' && (
              <SecurityView
                loading={loading}
                onChangePassword={async (input) => {
                  try {
                    const result = await changePasswordMutation.mutateAsync(input)
                    setNotice({ type: 'success', text: result.message })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
                onForgotPassword={async (email) => {
                  try {
                    const result = await forgotPasswordMutation.mutateAsync(email)
                    setNotice({ type: 'success', text: result.message })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
                onResendVerification={async (email) => {
                  try {
                    const result = await resendVerificationMutation.mutateAsync(email)
                    setNotice({ type: 'success', text: result.message })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
                onResetPassword={async (input) => {
                  try {
                    const result = await resetPasswordMutation.mutateAsync(input)
                    setNotice({ type: 'success', text: result.message })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
                onVerifyEmail={async (token) => {
                  try {
                    const result = await verifyEmailMutation.mutateAsync(token)
                    setNotice({ type: 'success', text: result.message })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
              />
            )}
          </div>

          <StatusSidebar backendStatus={backendStatus} recipesCount={recipes.length} user={currentUser} />
        </section>
      </div>
      <BottomNavbar currentView={view} user={currentUser} onNavigate={guardedSetView} />
    </main>
  )
}
