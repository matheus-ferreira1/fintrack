export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  category: {
    name: string
    color: string
    type: TransactionType
  }
  amount: string
  description: string
  type: TransactionType
  isRecurring: boolean
  date: string
  createdAt: string
  updatedAt: string
}

export interface TransactionSummary {
  totalTransactions: number
  totalIncome: string
  totalExpenses: string
  net: string
}

export interface TransactionListResponse {
  data: Transaction[]
  total: number
  page: number
  perPage: number
}
