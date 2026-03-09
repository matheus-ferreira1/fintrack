import type { FetchError } from 'ofetch'

export function parseApiError(err: unknown): string {
  const error = err as FetchError
  return error.data?.message ?? error.data?.statusMessage ?? 'An unknown error occurred'
}
