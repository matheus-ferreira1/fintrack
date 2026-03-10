export default defineNuxtPlugin((nuxtApp) => {
  const { clear: clearSession } = useUserSession()

  const api = $fetch.create({
    async onResponseError({ response }) {
      if (response.status === 401) {
        clearSession()
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
