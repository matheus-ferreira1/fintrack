import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(6).max(128),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const isPasswordValid = await comparePassword(body.password, user.passwordHash)
  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  await setUserSession(event, {
    user,
  })

  setResponseStatus(event, 201)
  return { user }
})
