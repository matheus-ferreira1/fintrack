<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <AppLogo />
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-lucide-log-in"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/register"
      />
    </template>

    <template #body>
      <UButton
        label="Sign in"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        to="/register"
        block
      />
    </template>
  </UHeader>
</template>
