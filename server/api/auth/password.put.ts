import { passwordSchema } from '#shared/schemas/password'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { users } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { user: requestUser } = await requireUserSession(event)

  const user = await db.query.users.findFirst({
    where: eq(users.email, requestUser.email),
  })
  if (!user) throw createError({
    statusCode: 404,
    message: 'User not found',
  })

  const passwordData = await readValidatedBody(event, passwordSchema.parse)

  const { newPassword, oldPassword } = passwordData

  const isOldPasswordValid = await comparePassword(
    oldPassword,
    user.passwordHash,
  )
  if (!isOldPasswordValid) {
    throw createError({
      statusCode: 400,
      message: 'Invalid credentials',
    })
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash)
  if (isSamePassword) {
    throw createError({
      statusCode: 400,
      message: 'New password must be different from current password',
    })
  }

  const hashedNewPassword = await createHashedPassword(newPassword)

  const isPasswordUpdated = await db.update(users)
    .set({ passwordHash: hashedNewPassword })
    .where(eq(users.id, user.id))
    .returning()

  if (!isPasswordUpdated[0]) {
    throw createError({
      statusCode: 400,
      message: 'Unable to update password',
    })
  }

  const { passwordHash: _, ...userWithoutPassword } = isPasswordUpdated[0]

  setResponseStatus(event, 201)
  return { user: userWithoutPassword }
})
