<script setup lang="ts">
import { loginSchema } from '#shared/schemas/auth'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const { fetch: refreshSession } = useUserSession()
const toast = useToast()
const pending = ref(false)

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
]

type Schema = z.output<typeof loginSchema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    pending.value = true
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: payload.data,
    })
    await refreshSession()
    await navigateTo('/dashboard')
    toast.add({ title: 'Welcome back!' })
  }
  catch (error) {
    toast.add({ title: 'Something went wrong', description: parseApiError(error), color: 'error' })
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="loginSchema"
    title="Welcome back"
    icon="i-lucide-lock"
    :loading="pending"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink
        to="/register"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>
  </UAuthForm>
</template>
