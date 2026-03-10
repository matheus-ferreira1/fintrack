<script setup lang="ts">
import { transactionSchema } from '#shared/schemas/transaction';
import type { Transaction, TransactionType } from '#shared/types/transaction';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

const { $api } = useNuxtApp()

const props = defineProps<{
  transaction?: Transaction | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  success: []
}>()

const toast = useToast()

const isEditing = computed(() => !!props.transaction)

const state = reactive({
  description: '',
  amount: 0,
  categoryId: '',
  type: 'expense' as TransactionType,
  isRecurring: false,
  date: '',
})

const calendarDate = ref<CalendarDate>(today(getLocalTimeZone()))
const loading = ref(false)

const typeOptions = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
]

const { data: categories, pending: loadingCategories } = await useAPI<Category[]>('/api/categories', {
  key: 'categories',
})

const filteredCategories = computed(() =>
  (categories.value ?? []).filter(c => c.type === state.type),
)

function syncDateFromCalendar(date: CalendarDate) {
  state.date = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

watch(calendarDate, syncDateFromCalendar)

watch(open, (isOpen) => {
  if (!isOpen) return

  if (props.transaction) {
    state.description = props.transaction.description
    state.amount = Number(props.transaction.amount)
    state.categoryId = props.transaction.categoryId
    state.type = props.transaction.type
    state.isRecurring = props.transaction.isRecurring
    state.date = props.transaction.date

    const [year, month, day] = props.transaction.date.split('-').map(Number)
    calendarDate.value = new CalendarDate(year!, month!, day!)
  }
  else {
    const now = today(getLocalTimeZone())
    state.description = ''
    state.amount = 0
    state.categoryId = ''
    state.type = 'expense'
    state.isRecurring = false
    calendarDate.value = now
    syncDateFromCalendar(now)
  }
})

watch(() => state.type, () => {
  state.categoryId = ''
})

async function onSubmit() {
  loading.value = true
  try {
    if (isEditing.value && props.transaction) {
      await $api(`/api/transactions/${props.transaction.id}`, {
        method: 'PUT',
        body: state,
      })
      toast.add({ title: 'Transaction updated', color: 'success', icon: 'i-lucide-check-circle' })
    }
    else {
      await $api('/api/transactions', {
        method: 'POST',
        body: state,
      })
      toast.add({ title: 'Transaction created', color: 'success', icon: 'i-lucide-check-circle' })
    }
    open.value = false
    emit('success')
  }
  catch (err) {
    toast.add({ title: 'Something went wrong', description: parseApiError(err), color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEditing ? 'Edit Transaction' : 'New Transaction'"
    :description="isEditing ? 'Update the transaction details.' : 'Record a new transaction.'"
  >
    <template #body>
      <UForm
        :schema="transactionSchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Description"
          name="description"
          required
        >
          <UInput
            v-model="state.description"
            placeholder="e.g. Grocery shopping"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="Type"
            name="type"
            required
          >
            <USelect
              v-model="state.type"
              :items="typeOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Amount"
            name="amount"
            required
          >
            <UInput
              v-model="state.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full"
            >
              <template #leading>
                <span class="text-muted text-sm">$</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField
          label="Category"
          name="categoryId"
          required
        >
          <USelectMenu
            v-model="state.categoryId"
            :items="filteredCategories"
            :loading="loadingCategories"
            value-key="id"
            label-key="name"
            placeholder="Select a category"
            search-input
            class="w-full"
          >
            <template #item-leading="{ item }">
              <span
                class="inline-block size-2.5 rounded-full ring-1 ring-default shrink-0"
                :style="{ backgroundColor: item.color }"
              />
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          label="Date"
          name="date"
          required
        >
          <UPopover>
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-calendar"
              class="w-full justify-start font-normal"
              :label="state.date || 'Pick a date'"
            />
            <template #content>
              <UCalendar v-model="calendarDate" />
            </template>
          </UPopover>
        </UFormField>

        <UFormField name="isRecurring">
          <div class="flex items-center gap-2">
            <UCheckbox
              v-model="state.isRecurring"
              label="Recurring transaction"
            />
          </div>
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            variant="ghost"
            label="Cancel"
            @click="open = false"
          />
          <UButton
            type="submit"
            :loading="loading"
            :label="isEditing ? 'Save' : 'Create'"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
