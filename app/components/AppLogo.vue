<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UIcon
      name="ic:baseline-wallet"
      class="size-7 text-primary"
    />
    <h1
      :class="[
        'font-bold text-xl text-primary',
        collapsed ? 'hidden' : 'block',
      ]"
    >
      FinTrack
    </h1>
  </div>
</template>
