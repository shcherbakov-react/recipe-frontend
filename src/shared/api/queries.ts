import { useMutation, useQuery } from '@tanstack/react-query'
import type { CreateRecipeInput, User } from '../types'
import { authApi } from './auth'
import { recipesApi } from './recipes'

export const queryKeys = {
  health: ['health'] as const,
  me: ['auth', 'me'] as const,
  recipes: (params: { q?: string; category_id?: string }) => ['recipes', params] as const,
  tags: ['recipes', 'tags'] as const,
  categories: ['recipes', 'categories'] as const,
}

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: authApi.health,
    retry: 1,
  })
}

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: authApi.me,
    enabled,
    retry: false,
  })
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authApi.login,
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authApi.register,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: authApi.logout,
  })
}

export function useUpdateMeMutation() {
  return useMutation({
    mutationFn: (input: Partial<Pick<User, 'username' | 'email' | 'avatar_url'>>) => authApi.updateMe(input),
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  })
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: authApi.resendVerification,
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  })
}

export function useRecipesQuery(params: { q?: string; category_id?: string }) {
  return useQuery({
    queryKey: queryKeys.recipes(params),
    queryFn: () => recipesApi.list({ ...params, limit: 50 }),
  })
}

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: recipesApi.listTags,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: recipesApi.listCategories,
  })
}

export function useCreateRecipeMutation() {
  return useMutation({
    mutationFn: (input: CreateRecipeInput) => recipesApi.create(input),
  })
}
