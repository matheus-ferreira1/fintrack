import type { FetchError } from 'ofetch'

export function useApiMutation<T>(
  url: string,
  options?: Parameters<typeof $fetch>[1],
) {
  const toast = useToast()
  const loading = ref(false)

  async function mutate(body?: Record<string, unknown>): Promise<T | undefined> {
    loading.value = true
    try {
      return await $fetch<T>(url, { ...options, body })
    }
    catch (err) {
      const error = err as FetchError
      const message = error.data?.message ?? error.data?.statusMessage ?? 'An unknown error occurred'
      toast.add({
        title: 'Something went wrong',
        description: message,
        color: 'error',
      })
    }
    finally {
      loading.value = false
    }
  }
  return { mutate, loading }
}
