<template>
  <USeparator
    icon="ic:baseline-wallet"
    class="h-px"
    :ui="{
      icon: 'text-primary',
    }"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <p class="py-6 text-muted">
      © {{ currentYear }} FinTrack. All rights reserved.
    </p>
  </UFooter>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
</script>
