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

const { mutate, loading } = useApiMutation<UserDTO>('/api/auth/login', {
  method: 'POST',
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const result = await mutate(payload.data)
  if (result) {
    await refreshSession()
    await navigateTo('/dashboard')
    toast.add({
      title: 'Welcome!',
    })
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="loginSchema"
    title="Welcome back"
    icon="i-lucide-lock"
    :loading="loading"
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
