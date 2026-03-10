<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DashboardOverview, MonthlyTrends, CategoryBreakdown, RecentTransactions, RecentTransaction } from '#shared/types/dashboard'

definePageMeta({
  middleware: 'auth',
})

const categoryType = ref<'income' | 'expense'>('expense')
const modalOpen = ref(false)

const { data: overview } = await useFetch<DashboardOverview>('/api/dashboard/overview')
const { data: trends } = await useFetch<MonthlyTrends>('/api/dashboard/monthly-trends')
const { data: breakdown } = await useFetch<CategoryBreakdown>('/api/dashboard/category-breakdown', {
  query: computed(() => ({ type: categoryType.value })),
})
const { data: recentTransactions, refresh: refreshRecent } = await useFetch<RecentTransactions>('/api/dashboard/recent-transactions')

const summaryCards = computed(() => [
  {
    label: 'Total Balance',
    value: overview.value?.balance,
    icon: 'i-lucide-wallet',
    colorClass: Number(overview.value?.balance.current ?? 0) >= 0 ? 'text-highlighted' : 'text-error-500',
  },
  {
    label: 'Monthly Income',
    value: overview.value?.monthlyIncome,
    icon: 'i-lucide-trending-up',
    colorClass: 'text-success-500',
  },
  {
    label: 'Monthly Expenses',
    value: overview.value?.monthlyExpenses,
    icon: 'i-lucide-trending-down',
    colorClass: 'text-error-500',
  },
  {
    label: 'Monthly Savings',
    value: overview.value?.monthlySavings,
    icon: 'i-lucide-piggy-bank',
    colorClass: Number(overview.value?.monthlySavings.current ?? 0) >= 0 ? 'text-success-500' : 'text-error-500',
  },
])

function badgeColor(changePercent: number | null, inverse = false) {
  if (changePercent === null) return null
  const positive = inverse ? changePercent < 0 : changePercent >= 0
  return positive ? 'success' : 'error'
}

function badgeLabel(changePercent: number | null) {
  if (changePercent === null) return ''
  return changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`
}

const recentColumns: TableColumn<RecentTransaction>[] = [
  { accessorKey: 'description', header: 'Transaction' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'amount', header: 'Amount' },
]
</script>

<template>
  <UDashboardPanel id="home-dashboard">
    <template #header>
      <UDashboardNavbar
        title="Dashboard"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Add Transaction"
            icon="i-lucide-plus"
            @click="modalOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard
            v-for="card in summaryCards"
            :key="card.label"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <UIcon
                  :name="card.icon"
                  class="size-5 text-muted shrink-0"
                />
                <div class="min-w-0">
                  <p class="text-sm text-muted truncate">
                    {{ card.label }}
                  </p>
                  <p
                    class="text-2xl font-semibold truncate"
                    :class="card.colorClass"
                  >
                    {{ formatCurrency(card.value?.current ?? 0) }}
                  </p>
                </div>
              </div>
              <UBadge
                v-if="card.value?.changePercent !== null && card.value?.changePercent !== undefined"
                :label="badgeLabel(card.value.changePercent)"
                :color="badgeColor(card.value.changePercent) ?? 'neutral'"
                variant="soft"
                size="xs"
                class="shrink-0 mt-1"
              />
            </div>
          </UCard>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UCard>
            <template #header>
              <p class="font-semibold text-highlighted">
                Income vs Expenses
              </p>
            </template>
            <ClientOnly>
              <DashboardOverviewBarChart
                v-if="trends"
                :data="trends"
              />
              <template #fallback>
                <div class="h-72 flex items-center justify-center">
                  <UIcon
                    name="i-lucide-loader"
                    class="size-6 text-muted animate-spin"
                  />
                </div>
              </template>
            </ClientOnly>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <p class="font-semibold text-highlighted">
                  Category Breakdown
                </p>
                <div class="flex">
                  <UButton
                    label="Expenses"
                    size="xs"
                    :variant="categoryType === 'expense' ? 'solid' : 'ghost'"
                    color="neutral"
                    @click="categoryType = 'expense'"
                  />
                  <UButton
                    label="Income"
                    size="xs"
                    :variant="categoryType === 'income' ? 'solid' : 'ghost'"
                    color="neutral"
                    @click="categoryType = 'income'"
                  />
                </div>
              </div>
            </template>
            <ClientOnly>
              <DashboardCategoryPieChart :data="breakdown ?? null" />
              <template #fallback>
                <div class="h-48 flex items-center justify-center">
                  <UIcon
                    name="i-lucide-loader"
                    class="size-6 text-muted animate-spin"
                  />
                </div>
              </template>
            </ClientOnly>
          </UCard>
        </div>

        <!-- Recent Transactions -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold text-highlighted">
                Recent Transactions
              </p>
              <UButton
                label="View all"
                variant="ghost"
                color="neutral"
                size="sm"
                to="/transactions"
                trailing-icon="i-lucide-arrow-right"
              />
            </div>
          </template>

          <UTable
            :data="recentTransactions ?? []"
            :columns="recentColumns"
            class="w-full"
          >
            <template #description-cell="{ row }">
              <div class="flex items-center gap-2">
                <span class="font-medium text-highlighted">{{ row.original.description }}</span>
                <UBadge
                  v-if="row.original.isRecurring"
                  label="Recurring"
                  icon="i-lucide-refresh-cw"
                  color="primary"
                  variant="soft"
                  size="xs"
                />
              </div>
            </template>

            <template #category-cell="{ row }">
              <div class="flex items-center gap-2">
                <span
                  class="inline-block size-2.5 rounded-full ring-1 ring-default shrink-0"
                  :style="{ backgroundColor: row.original.category.color }"
                />
                <span class="text-sm text-muted">{{ row.original.category.name }}</span>
              </div>
            </template>

            <template #date-cell="{ row }">
              <span class="text-sm text-muted">{{ formatDate(row.original.date) }}</span>
            </template>

            <template #amount-cell="{ row }">
              <span
                class="font-medium tabular-nums"
                :class="row.original.type === 'income' ? 'text-success-500' : 'text-error-500'"
              >
                {{ row.original.type === 'income' ? '+' : '-' }}{{ formatCurrency(row.original.amount) }}
              </span>
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-8 text-center">
                <UIcon
                  name="i-lucide-receipt"
                  class="size-10 text-muted mb-3"
                />
                <p class="text-sm text-muted">
                  No transactions yet
                </p>
              </div>
            </template>
          </UTable>
        </UCard>
      </div>

      <TransactionsTransactionModal
        v-model:open="modalOpen"
        @success="refreshRecent"
      />
    </template>
  </UDashboardPanel>
</template>
