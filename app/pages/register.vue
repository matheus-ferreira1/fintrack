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
const pending = ref(false)

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

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    pending.value = true
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: payload.data,
    })
    await refreshSession()
    await navigateTo('/dashboard')
    toast.add({ title: 'Welcome!' })
  }
  catch (err) {
    toast.add({ title: 'Something went wrong', description: parseApiError(err), color: 'error' })
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="registerSchema"
    :loading="pending"
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
