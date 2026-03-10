<script setup lang="ts">
import type { RecurringPreview } from '#shared/types/transaction';

const { $api } = useNuxtApp()

const props = defineProps<{
  sourceMonth: number
  sourceYear: number
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  success: []
}>()

const toast = useToast()

const previewQuery = computed(() => ({
  month: props.sourceMonth,
  year: props.sourceYear,
}))

const { data: preview, pending, refresh } = await useAPI<RecurringPreview>('/api/transactions/recurring/preview', {
  query: previewQuery,
  immediate: false,
  watch: false,
})

watch(open, (isOpen) => {
  if (isOpen) refresh()
})

const generating = ref(false)

async function handleGenerate() {
  generating.value = true
  try {
    const result = await $api<{ count: number }>('/api/transactions/recurring/generate', {
      method: 'POST',
      body: {
        sourceMonth: props.sourceMonth,
        sourceYear: props.sourceYear,
      },
    })
    toast.add({
      title: 'Recurring transactions generated',
      description: `${result.count} transaction${result.count === 1 ? '' : 's'} created for ${targetLabel.value}`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    open.value = false
    emit('success')
  }
  catch (err) {
    toast.add({ title: 'Something went wrong', description: parseApiError(err), color: 'error' })
  }
  finally {
    generating.value = false
  }
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const targetLabel = computed(() => {
  if (!preview.value) return ''
  return `${monthNames[preview.value.targetMonth - 1]} ${preview.value.targetYear}`
})

const canGenerate = computed(() =>
  !pending.value
  && !preview.value?.alreadyGenerated
  && (preview.value?.transactions.length ?? 0) > 0,
)
</script>

<template>
  <UModal
    v-model:open="open"
    title="Generate Recurring Transactions"
    :description="`Preview recurring transactions to copy into ${targetLabel || 'next month'}`"
  >
    <template #body>
      <div
        v-if="pending"
        class="flex items-center justify-center py-8"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 animate-spin text-muted"
        />
      </div>

      <div
        v-else-if="preview?.alreadyGenerated"
        class="flex flex-col items-center gap-3 py-6 text-center"
      >
        <UIcon
          name="i-lucide-info"
          class="size-8 text-warning-500"
        />
        <p class="text-sm text-muted">
          Recurring transactions have already been generated for <span class="font-medium text-highlighted">{{ targetLabel }}</span>.
        </p>
      </div>

      <div
        v-else-if="!preview?.transactions.length"
        class="flex flex-col items-center gap-3 py-6 text-center"
      >
        <UIcon
          name="i-lucide-inbox"
          class="size-8 text-muted"
        />
        <p class="text-sm text-muted">
          No recurring transactions found for the selected month.
        </p>
      </div>

      <div
        v-else
        class="flex flex-col gap-3"
      >
        <p class="text-sm text-muted">
          The following {{ preview!.transactions.length }} recurring transaction{{ preview!.transactions.length === 1 ? '' : 's' }} will be created in <span class="font-medium text-highlighted">{{ targetLabel }}</span> with amount set to $0.00:
        </p>

        <div class="flex flex-col gap-2 max-h-64 overflow-y-auto">
          <div
            v-for="(t, i) in preview!.transactions"
            :key="i"
            class="flex items-center justify-between gap-3 rounded-lg border border-default p-3"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="inline-block size-2.5 rounded-full ring-1 ring-default shrink-0"
                :style="{ backgroundColor: t.categoryColor }"
              />
              <span class="text-sm font-medium text-highlighted truncate">{{ t.description }}</span>
              <UBadge
                :label="t.type"
                :color="t.type === 'income' ? 'success' : 'error'"
                variant="soft"
                size="xs"
              />
            </div>
            <span class="text-xs text-muted whitespace-nowrap">{{ t.targetDate }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            variant="ghost"
            label="Cancel"
            @click="open = false"
          />
          <UButton
            label="Generate"
            icon="i-lucide-copy-plus"
            :loading="generating"
            :disabled="!canGenerate"
            @click="handleGenerate"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
