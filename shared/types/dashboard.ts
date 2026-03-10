export interface DashboardCardMetric {
  current: string
  previous: string
  changePercent: number | null
}

export interface DashboardOverview {
  balance: DashboardCardMetric
  monthlyIncome: DashboardCardMetric
  monthlyExpenses: DashboardCardMetric
  monthlySavings: DashboardCardMetric
}

export interface MonthlyTrendPoint {
  month: string
  year: number
  income: string
  expenses: string
}
export type MonthlyTrends = MonthlyTrendPoint[]

export interface CategoryBreakdownItem {
  categoryId: string
  name: string
  color: string
  amount: string
  percentage: number
}
export interface CategoryBreakdown {
  type: 'income' | 'expense'
  total: string
  items: CategoryBreakdownItem[]
}

export interface RecentTransaction {
  id: string
  description: string
  amount: string
  type: 'income' | 'expense'
  date: string
  isRecurring: boolean
  category: { name: string; color: string }
}
export type RecentTransactions = RecentTransaction[]
