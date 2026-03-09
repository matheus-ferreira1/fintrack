import type { TransactionType } from './transaction'

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  type: TransactionType
  createdAt: string
}
