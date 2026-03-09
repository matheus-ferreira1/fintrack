<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="space-y-8">
    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="subtle"
    >
      profile data
    </upagecard>
  </div>
</template>
