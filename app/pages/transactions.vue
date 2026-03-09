<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <UDashboardPanel id="transactions">
    <template #header>
      <UDashboardNavbar
        title="Transactions"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          Button to trigger Transaction modal (create and edit)
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      data
    </template>
  </UDashboardPanel>
</template>
