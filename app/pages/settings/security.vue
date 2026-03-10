<script setup lang="ts">
import { type PasswordSchema, passwordSchema } from '#shared/schemas/password'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth',
})

const toast = useToast()

const isLoading = ref(false)
const password = reactive<Partial<PasswordSchema>>({
  oldPassword: undefined,
  newPassword: undefined,
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.oldPassword && state.newPassword && state.oldPassword === state.newPassword) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  const { $api } = useNuxtApp()
  isLoading.value = true

  try {
    await $api('/api/auth/password', {
      method: 'PUT',
      body: event.data,
    })
    toast.add({
      title: 'Password updated successfully!',
    })
    password.oldPassword = undefined
    password.newPassword = undefined
  }
  catch (err) {
    toast.add({
      title: 'Something went wrong',
      description: parseApiError(err),
      color: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <UPageCard
      title="Password"
      description="Confirm your current password before setting a new one."
      variant="subtle"
    >
      <UForm
        :schema="passwordSchema"
        :state="password"
        :validate="validate"
        class="flex flex-col gap-4 max-w-xs"
        @submit="onSubmit"
      >
        <UFormField name="oldPassword">
          <UInput
            v-model="password.oldPassword"
            type="password"
            placeholder="Current password"
            class="w-full"
          />
        </UFormField>

        <UFormField name="newPassword">
          <UInput
            v-model="password.newPassword"
            type="password"
            placeholder="New password"
            class="w-full"
          />
        </UFormField>

        <UButton
          label="Update"
          class="w-fit"
          type="submit"
          :loading="isLoading"
        />
      </UForm>
    </UPageCard>

    <UPageCard
      title="Account"
      description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
      class="bg-linear-to-tl from-error/10 from-5% to-default"
    >
      <template #footer>
        <UButton
          label="Delete account"
          color="error"
          disabled
        />
      </template>
    </UPageCard>
  </div>
</template>
