import { loginSchema } from '#shared/schemas/auth'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'

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
