import { useMutation, useQuery } from '@tanstack/react-query'
import type { User } from '../types'
import { authApi } from './auth'

export const queryKeys = {
  health: ['health'] as const,
  me: ['auth', 'me'] as const,
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
