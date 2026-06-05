import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthView } from '../features/auth/ui/AuthView'
import { CreateRecipeView } from '../features/create-recipe/ui/CreateRecipeView'
import { ProfileView } from '../features/profile/ui/ProfileView'
import { SecurityView } from '../features/security/ui/SecurityView'
import { RecipesPage } from '../pages/recipes/ui/RecipesPage'
import {
  queryKeys,
  useChangePasswordMutation,
  useCategoriesQuery,
  useCreateRecipeMutation,
  useForgotPasswordMutation,
  useHealthQuery,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useRecipesQuery,
  useRegisterMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useRandomRecipeMutation,
  useTagsQuery,
  useUpdateMeMutation,
  useVerifyEmailMutation,
} from '../shared/api/queries'
import { storeTokens } from '../shared/api/tokens'
import { hasOAuthCallback, readInitialTokens } from '../shared/lib/auth'
import { toNotice } from '../shared/lib/notice'
import type { AuthMode, AuthResponse, Notice, TokenPair, User, View } from '../shared/types'
import { NoticeBanner } from '../shared/ui/NoticeBanner/NoticeBanner'
import { AppHeader } from '../widgets/app-header/ui/AppHeader'
import { BottomNavbar } from '../widgets/bottom-navbar/ui/BottomNavbar'
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
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [randomRecipeID, setRandomRecipeID] = useState<string | null>(null)
  const healthQuery = useHealthQuery()
  const meQuery = useMeQuery(Boolean(tokens))
  const currentUser = user ?? meQuery.data ?? null
  const recipesScope = currentUser ? (onlyMine ? 'mine' : 'available') : 'public'
  const recipesQuery = useRecipesQuery({ q: query || undefined, category_id: category || undefined, scope: recipesScope })
  const categoriesQuery = useCategoriesQuery()
  const tagsQuery = useTagsQuery()
  const createRecipeMutation = useCreateRecipeMutation()
  const randomRecipeMutation = useRandomRecipeMutation()
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
    createRecipeMutation.isPending ||
    randomRecipeMutation.isPending ||
    updateMeMutation.isPending ||
    changePasswordMutation.isPending ||
    verifyEmailMutation.isPending ||
    resendVerificationMutation.isPending ||
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending
  const backendStatus = healthQuery.isPending ? 'checking' : healthQuery.isError ? 'offline' : 'online'
  const recipesRaw = recipesQuery.data?.items ?? []
  const randomRecipe = recipesRaw.find((recipe) => recipe.id === randomRecipeID)
  const recipes = randomRecipe ? [randomRecipe, ...recipesRaw.filter((recipe) => recipe.id !== randomRecipe.id)] : recipesRaw
  const totalRecipes = recipesQuery.data?.total ?? 0
  const categories = categoriesQuery.data ?? []
  const tags = tagsQuery.data ?? []

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
                onRandom={async () => {
                  try {
                    if (onlyMine) {
                      const recipe = recipesRaw[Math.floor(Math.random() * recipesRaw.length)]
                      if (recipe) setRandomRecipeID(recipe.id)
                      return
                    }

                    const recipe = await randomRecipeMutation.mutateAsync(currentUser ? 'available' : 'public')
                    setRandomRecipeID(recipe.id)
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
                }}
                onlyMine={onlyMine}
                query={query}
                recipes={recipes}
                setQuery={setQuery}
                setOnlyMine={setOnlyMine}
                showScopeToggle={Boolean(currentUser)}
                total={totalRecipes}
              />
            )}

            {view === 'create' && (
              <CreateRecipeView
                categories={categories}
                loading={createRecipeMutation.isPending}
                tags={tags}
                onCreate={async (recipe) => {
                  try {
                    await createRecipeMutation.mutateAsync(recipe)
                    await queryClient.invalidateQueries({ queryKey: ['recipes'] })
                    setView('recipes')
                    setNotice({ type: 'success', text: 'Рецепт создан.' })
                  } catch (error) {
                    setNotice(toNotice(error))
                  }
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

        </section>
      </div>
      <BottomNavbar currentView={view} user={currentUser} onNavigate={guardedSetView} />
    </main>
  )
}
