import { profileSchema } from '#shared/schemas/profile'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { email, name } = await readValidatedBody(event, profileSchema.parse)

  const { user } = await requireUserSession(event)
  if (!user) throw createError({
    statusCode: 404,
    message: 'User not found',
  })

  if (email && email !== user.email) {
    const emailExistsExcludingUser = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, user.id)),
    })

    if (emailExistsExcludingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email already in use',
      })
    }
  }

  const updatedUser = await db.update(users)
    .set({ email, name })
    .where(eq(users.id, user.id))
    .returning()

  if (!updatedUser[0]) {
    throw createError({
      statusCode: 400,
      message: 'Unable to update user profile',
    })
  }

  await setUserSession(event, {
    user: updatedUser[0],
  })

  const { passwordHash: _, ...userWithoutPassword } = updatedUser[0]

  return { user: userWithoutPassword }
})
