<script setup lang="ts">
import { categorySchema } from '#shared/schemas/category';

const props = defineProps<{
  category?: Category | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  success: []
}>()

const toast = useToast()

const isEditing = computed(() => !!props.category)

const state = reactive({
  name: '',
  type: 'expense' as TransactionType,
  color: '#6366f1',
})

const loading = ref(false)

const typeOptions = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]

watch(() => props.category, (cat) => {
  if (cat) {
    state.name = cat.name
    state.type = cat.type
    state.color = cat.color
  }
  else {
    state.name = ''
    state.type = 'expense'
    state.color = '#6366f1'
  }
})

async function onSubmit() {
  loading.value = true
  try {
    if (isEditing.value && props.category) {
      await $fetch(`/api/categories/${props.category.id}`, {
        method: 'PUT',
        body: state,
      })
      toast.add({ title: 'Category updated', color: 'success', icon: 'i-lucide-check-circle' })
    }
    else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: state,
      })
      toast.add({ title: 'Category created', color: 'success', icon: 'i-lucide-check-circle' })
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
    :title="isEditing ? 'Edit Category' : 'New Category'"
    :description="isEditing ? 'Update the category details.' : 'Create a new category for your transactions.'"
  >
    <template #body>
      <UForm
        :schema="categorySchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="e.g. Groceries"
            class="w-full"
          />
        </UFormField>

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
          label="Color"
          name="color"
          required
        >
          <UColorPicker
            v-model="state.color"
            size="sm"
          />
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
