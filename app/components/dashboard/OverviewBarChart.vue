<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import type { MonthlyTrends } from '#shared/types/dashboard'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  data: MonthlyTrends
}>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.month),
  datasets: [
    {
      label: 'Income',
      data: props.data.map(d => Number(d.income)),
      backgroundColor: '#22c55e',
      borderRadius: 4,
    },
    {
      label: 'Expenses',
      data: props.data.map(d => Number(d.expenses)),
      backgroundColor: '#ef4444',
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          `${ctx.dataset.label ?? ''}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: string | number) => formatCurrency(value),
      },
    },
  },
}
</script>

<template>
  <div class="h-72">
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
