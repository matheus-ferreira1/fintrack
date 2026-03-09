import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing transaction ID' })
  }

  const [deleted] = await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return { success: true }
})
