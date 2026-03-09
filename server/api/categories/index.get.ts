import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { categories } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return await db.query.categories.findMany({
    where: eq(categories.userId, session.user.id),
    orderBy: (categories, { asc }) => [asc(categories.name)],
  })
})
