<script setup lang="ts">
import { registerSchema } from '#shared/schemas/auth'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type * as z from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const { fetch: refreshSession } = useUserSession()
const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Enter your name',
  },
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

type Schema = z.output<typeof registerSchema>

const { mutate, loading } = useApiMutation<UserDTO>('/api/auth/register', {
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
    :schema="registerSchema"
    :loading="loading"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>
  </UAuthForm>
</template>
