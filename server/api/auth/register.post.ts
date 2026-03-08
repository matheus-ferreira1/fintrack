import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'

const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password: z.string().min(6).max(128),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  const existing = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  })

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const passwordHash = await hashPassword(body.password)

  const [user] = await db.insert(users).values({
    name: body.name,
    email: body.email,
    passwordHash,
  }).returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, updatedAt: users.updatedAt })

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })
  }

  await setUserSession(event, {
    user,
  })

  setResponseStatus(event, 201)
  return { user }
})
