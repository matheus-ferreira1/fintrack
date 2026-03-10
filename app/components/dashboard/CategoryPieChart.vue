<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type TooltipItem } from 'chart.js'
import type { CategoryBreakdown } from '#shared/types/dashboard'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: CategoryBreakdown | null
}>()

const hasData = computed(() => (props.data?.items.length ?? 0) > 0)

const chartData = computed(() => ({
  labels: props.data?.items.map(i => i.name) ?? [],
  datasets: [
    {
      data: props.data?.items.map(i => Number(i.amount)) ?? [],
      backgroundColor: props.data?.items.map(i => i.color) ?? [],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'doughnut'>) =>
          `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
      },
    },
  },
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="hasData">
      <div class="h-48">
        <Doughnut
          :data="chartData"
          :options="chartOptions"
        />
      </div>

      <ul class="flex flex-col gap-2">
        <li
          v-for="item in data!.items"
          :key="item.categoryId"
          class="flex items-center justify-between gap-2 text-sm"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="inline-block size-2.5 rounded-full ring-1 ring-default shrink-0"
              :style="{ backgroundColor: item.color }"
            />
            <span class="truncate text-muted">{{ item.name }}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0 tabular-nums">
            <span class="font-medium">{{ formatCurrency(item.amount) }}</span>
            <span class="text-muted text-xs">{{ item.percentage }}%</span>
          </div>
        </li>
      </ul>
    </template>

    <div
      v-else
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <UIcon
        name="i-lucide-pie-chart"
        class="size-10 text-muted mb-3"
      />
      <p class="text-sm text-muted">
        No {{ data?.type ?? 'expense' }} data this month
      </p>
    </div>
  </div>
</template>
