import { categorySchema } from '#shared/schemas/category'
import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { categories } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category ID' })
  }

  const body = await readValidatedBody(event, categorySchema.parse)

  const [updated] = await db.update(categories)
    .set(body)
    .where(and(eq(categories.id, id), eq(categories.userId, session.user.id)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return updated
})
