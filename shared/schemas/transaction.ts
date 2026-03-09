import z from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number({ coerce: true }).positive('Amount must be positive'),
  categoryId: z.string().uuid('Category is required'),
  type: z.enum(['income', 'expense']),
  isRecurring: z.boolean().default(false),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export type TransactionInput = z.infer<typeof transactionSchema>
