<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth',
})

const { $api } = useNuxtApp()

const toast = useToast()
const confirm = useConfirmDialog()

const { data: categories, refresh, pending } = await useAPI<Category[]>('/api/categories', { key: 'categories' })

const search = ref('')
const isDeleting = ref(false)
const typeFilter = ref<'all' | 'income' | 'expense'>('all')

const filteredCategories = computed(() => {
  if (!categories.value) return []
  return categories.value.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || c.type === typeFilter.value
    return matchesSearch && matchesType
  })
})

const stats = computed(() => {
  const all = categories.value ?? []
  return [
    { label: 'Total Categories', value: all.length, icon: 'i-lucide-layers' },
    { label: 'Income', value: all.filter(c => c.type === 'income').length, icon: 'i-lucide-trending-up' },
    { label: 'Expenses', value: all.filter(c => c.type === 'expense').length, icon: 'i-lucide-trending-down' },
  ]
})

const modalOpen = ref(false)
const editingCategory = ref<Category | null>(null)

function openCreateModal() {
  editingCategory.value = null
  modalOpen.value = true
}

function openEditModal(category: Category) {
  editingCategory.value = category
  modalOpen.value = true
}

async function handleDelete(id: string) {
  const confirmed = await confirm({
    title: 'Delete category',
    description: 'Are you sure you want to delete this category?',
  })

  if (confirmed) {
    try {
      isDeleting.value = true
      await $api(`/api/categories/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Category deleted', color: 'success', icon: 'i-lucide-check-circle' })
      refresh()
    }
    catch (err) {
      toast.add({ title: 'Something went wrong', description: parseApiError(err), color: 'error' })
    }
    finally {
      isDeleting.value = false
    }
  }
}

function getDropdownItems(category: Category) {
  return [
    [
      { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => openEditModal(category) },
    ],
    [
      { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => handleDelete(category.id) },
    ],
  ]
}

const typeFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]

const columns: TableColumn<Category>[] = [
  { accessorKey: 'color', header: 'Color' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'actions', header: '' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-3 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="stat.icon"
            class="size-5 text-muted"
          />
          <div>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-semibold text-highlighted">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex items-center gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search categories..."
        class="flex-1"
      />
      <USelect
        v-model="typeFilter"
        :items="typeFilterOptions"
        value-key="value"
        class="w-36"
      />
      <UButton
        label="Add Category"
        icon="i-lucide-plus"
        @click="openCreateModal"
      />
    </div>

    <UTable
      :data="filteredCategories"
      :columns="columns"
      :loading="pending"
      class="w-full"
    >
      <template #color-cell="{ row }">
        <span
          class="inline-block size-4 rounded-full ring-1 ring-default"
          :style="{ backgroundColor: row.original.color }"
        />
      </template>

      <template #name-cell="{ row }">
        <span class="font-medium text-highlighted">{{ row.original.name }}</span>
      </template>

      <template #type-cell="{ row }">
        <UBadge
          :label="row.original.type"
          :color="row.original.type === 'income' ? 'success' : 'error'"
          variant="subtle"
          class="capitalize"
        />
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

      <template #empty>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <UIcon
            name="material-symbols:category-outline"
            class="size-10 text-muted mb-3"
          />
          <p class="text-sm text-muted">
            No categories found
          </p>
          <UButton
            label="Create your first category"
            variant="link"
            class="mt-2"
            @click="openCreateModal"
          />
        </div>
      </template>
    </UTable>

    <CategoriesCategoryModal
      v-model:open="modalOpen"
      :category="editingCategory"
      @success="refresh"
    />
  </div>
</template>
