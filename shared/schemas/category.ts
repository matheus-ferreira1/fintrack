import z from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  type: z.enum(['income', 'expense']),
})

export type CategoryInput = z.infer<typeof categorySchema>
