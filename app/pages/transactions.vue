<script setup lang="ts">
import type { Transaction, TransactionListResponse, TransactionSummary } from '#shared/types/transaction'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth',
})

const { $api } = useNuxtApp()

const toast = useToast()
const confirm = useConfirmDialog()

const search = ref('')
const debouncedSearch = ref('')
const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const sortOrder = ref<'newest' | 'oldest'>('newest')
const selectedMonth = ref<number>(new Date().getMonth() + 1)
const selectedYear = ref<number>(new Date().getFullYear())
const page = ref(1)
const perPage = ref(10)

let searchDebounceTimer: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    debouncedSearch.value = value
    page.value = 1
  }, 300)
})

watch([typeFilter, sortOrder, selectedMonth, selectedYear, perPage], () => {
  page.value = 1
})

const sharedFilterQuery = computed(() => ({
  month: selectedMonth.value,
  year: selectedYear.value,
}))

const listQuery = computed(() => ({
  ...sharedFilterQuery.value,
  search: debouncedSearch.value,
  type: typeFilter.value === 'all' ? undefined : typeFilter.value,
  sort: sortOrder.value,
  page: page.value,
  perPage: perPage.value,
}))

const { data: transactionList, refresh: refreshList, pending: listPending } = useAPI<TransactionListResponse>('/api/transactions', {
  key: 'transactions',
  query: listQuery,
})

const { data: summary, refresh: refreshSummary } = useAPI<TransactionSummary>('/api/transactions/summary', {
  key: 'transactions-summary',
  query: sharedFilterQuery,
})

async function refreshAll() {
  await Promise.all([refreshList(), refreshSummary()])
}

const transactions = computed(() => transactionList.value?.data ?? [])
const totalTransactions = computed(() => transactionList.value?.total ?? 0)

const modalOpen = ref(false)
const generateRecurringOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)

function openCreateModal() {
  editingTransaction.value = null
  modalOpen.value = true
}

function openEditModal(transaction: Transaction) {
  editingTransaction.value = transaction
  modalOpen.value = true
}

const isDeleting = ref(false)

async function handleDelete(id: string) {
  const confirmed = await confirm({
    title: 'Delete transaction',
    description: 'Are you sure you want to delete this transaction? This action cannot be undone.',
  })

  if (!confirmed) return

  try {
    isDeleting.value = true
    await $api(`/api/transactions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Transaction deleted', color: 'success', icon: 'i-lucide-check-circle' })
    await refreshAll()
  }
  catch (err) {
    toast.add({ title: 'Something went wrong', description: parseApiError(err), color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}

function getDropdownItems(transaction: Transaction) {
  return [
    [
      { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEditModal(transaction) },
    ],
    [
      { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => handleDelete(transaction.id) },
    ],
  ]
}

const typeFilterOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
]

const perPageOptions = [
  { label: '10 per page', value: 10 },
  { label: '25 per page', value: 25 },
  { label: '50 per page', value: 50 },
]

const monthOptions = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i,
}))

const summaryCards = computed(() => [
  {
    label: 'Total Transactions',
    value: summary.value?.totalTransactions ?? 0,
    display: String(summary.value?.totalTransactions ?? 0),
    icon: 'i-lucide-receipt',
    colorClass: 'text-highlighted',
  },
  {
    label: 'Total Income',
    value: summary.value?.totalIncome ?? '0',
    display: formatCurrency(summary.value?.totalIncome ?? 0),
    icon: 'i-lucide-trending-up',
    colorClass: 'text-success-500',
  },
  {
    label: 'Total Expenses',
    value: summary.value?.totalExpenses ?? '0',
    display: formatCurrency(summary.value?.totalExpenses ?? 0),
    icon: 'i-lucide-trending-down',
    colorClass: 'text-error-500',
  },
  {
    label: 'Net',
    value: summary.value?.net ?? '0',
    display: formatCurrency(summary.value?.net ?? 0),
    icon: 'i-lucide-wallet',
    colorClass: Number(summary.value?.net ?? 0) >= 0 ? 'text-success-500' : 'text-error-500',
  },
])

const columns: TableColumn<Transaction>[] = [
  { accessorKey: 'description', header: 'Transaction' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'actions', header: '' },
]

const paginationStart = computed(() => ((page.value - 1) * perPage.value) + 1)
const paginationEnd = computed(() => Math.min(page.value * perPage.value, totalTransactions.value))
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
          <UButton
            label="Generate Recurring"
            icon="i-lucide-refresh-cw"
            variant="outline"
            @click="generateRecurringOpen = true"
          />
          <UButton
            label="Add Transaction"
            icon="i-lucide-plus"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard
            v-for="card in summaryCards"
            :key="card.label"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="card.icon"
                class="size-5 text-muted shrink-0"
              />
              <div class="min-w-0">
                <p class="text-sm text-muted truncate">
                  {{ card.label }}
                </p>
                <USkeleton
                  v-if="!summary"
                  class="h-8 w-32 mt-1"
                />
                <p
                  v-else
                  class="text-2xl font-semibold truncate"
                  :class="card.colorClass"
                >
                  {{ card.display }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search transactions..."
            class="flex-1 min-w-48"
          />
          <USelect
            v-model="typeFilter"
            :items="typeFilterOptions"
            value-key="value"
            class="w-36"
          />
          <USelect
            v-model="sortOrder"
            :items="sortOptions"
            value-key="value"
            class="w-36"
          />
          <USelect
            v-model="selectedMonth"
            :items="monthOptions"
            value-key="value"
            class="w-36"
          />
          <USelect
            v-model="selectedYear"
            :items="yearOptions"
            value-key="value"
            class="w-28"
          />
        </div>

        <UTable
          :data="transactions"
          :columns="columns"
          :loading="listPending"
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

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="getDropdownItems(row.original)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                variant="ghost"
                color="neutral"
                size="sm"
              />
            </UDropdownMenu>
          </template>

          <template #loading>
            <div class="h-20 flex w-full items-center justify-center">
              <UIcon
                name="i-lucide-loader-2"
                class="size-6 text-muted animate-spin mx-auto my-6"
              />
            </div>
          </template>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <UIcon
                name="i-lucide-receipt"
                class="size-10 text-muted mb-3"
              />
              <p class="text-sm text-muted">
                No transactions found
              </p>
              <UButton
                label="Add your first transaction"
                variant="link"
                class="mt-2"
                @click="openCreateModal"
              />
            </div>
          </template>
        </UTable>

        <div
          v-if="totalTransactions > 0"
          class="flex flex-wrap items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <USelect
              v-model="perPage"
              :items="perPageOptions"
              value-key="value"
              class="w-36"
            />
            <span class="text-sm text-muted whitespace-nowrap">
              Showing {{ paginationStart }}–{{ paginationEnd }} of {{ totalTransactions }}
            </span>
          </div>

          <UPagination
            v-model:page="page"
            :total="totalTransactions"
            :items-per-page="perPage"
            show-edges
          />
        </div>
      </div>

      <TransactionsTransactionModal
        v-model:open="modalOpen"
        :transaction="editingTransaction"
        @success="refreshAll"
      />

      <TransactionsGenerateRecurringModal
        v-model:open="generateRecurringOpen"
        :source-month="selectedMonth"
        :source-year="selectedYear"
        @success="refreshAll"
      />
    </template>
  </UDashboardPanel>
</template>
