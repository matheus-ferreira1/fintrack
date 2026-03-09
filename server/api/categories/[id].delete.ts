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

  try {
    const [deleted] = await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, session.user.id)))
      .returning()

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    return { success: true }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const dbError = error as { code?: string }
    if (dbError.code === '23503') {
      throw createError({ statusCode: 409, statusMessage: 'Cannot delete category with existing transactions' })
    }

    throw createError({ statusCode: 500, statusMessage: 'Failed to delete category' })
  }
})
