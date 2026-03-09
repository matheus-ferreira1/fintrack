// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'nuxt-auth-utils', '@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3003,
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
