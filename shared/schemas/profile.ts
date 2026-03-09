import z from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
})

export type ProfileSchema = z.output<typeof profileSchema>
