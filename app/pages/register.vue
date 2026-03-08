<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

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

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type Schema = z.output<typeof schema>

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
    :schema="schema"
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
