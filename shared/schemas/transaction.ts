import z from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number({ coerce: true }).positive('Amount must be positive'),
  categoryId: z.string().uuid('Category is required'),
  type: z.enum(['income', 'expense']),
  isRecurring: z.boolean().default(false),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export const generateRecurringSchema = z.object({
  sourceMonth: z.number().int().min(1).max(12),
  sourceYear: z.number().int().min(2000).max(2100),
})

export type TransactionInput = z.infer<typeof transactionSchema>
