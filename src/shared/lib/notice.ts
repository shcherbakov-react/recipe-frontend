import { ApiClientError } from '../api/client'
import type { Notice } from '../types'

export function toNotice(error: unknown): Notice {
  if (error instanceof ApiClientError) {
    return { type: 'error', text: error.message }
  }

  if (error instanceof Error) {
    return { type: 'error', text: error.message }
  }

  return { type: 'error', text: 'Неизвестная ошибка' }
}
