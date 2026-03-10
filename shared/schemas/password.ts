import z from 'zod'

export const passwordSchema = z.object({
  oldPassword: z.string().min(8, 'Must be at least 8 characters'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
})

export type PasswordSchema = z.output<typeof passwordSchema>
