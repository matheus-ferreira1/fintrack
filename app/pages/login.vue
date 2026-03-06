<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const { fetch: refreshSession } = useUserSession()
const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password'
  }
]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type Schema = z.output<typeof schema>

  const {mutate, loading} = useApiMutation<UserDTO>('/api/auth/login', {
    method: 'POST'
  })
async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const result = await mutate(payload.data)
  if (result) {
    await refreshSession()
    await navigateTo('/dashboard')
    toast.add({
      title: 'Welcome!'
    })
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
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
