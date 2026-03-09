import { transactionSchema } from '#shared/schemas/transaction'
import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { categories, transactions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing transaction ID' })
  }

  const body = await readValidatedBody(event, transactionSchema.parse)

  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, body.categoryId),
      eq(categories.userId, session.user.id),
    ),
  })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  if (category.type !== body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction type must match category type' })
  }

  const [updated] = await db.update(transactions)
    .set({ ...body, amount: String(body.amount) })
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  return updated
})
