import { and, eq, sql, sum } from 'drizzle-orm'
import { db } from '~~/server/database'
import { categories, transactions } from '~~/server/database/schema'
import type { CategoryBreakdown } from '#shared/types/dashboard'

export default defineEventHandler(async (event): Promise<CategoryBreakdown> => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = session.user.id
  const query = getQuery(event)
  const type = (query.type === 'income' ? 'income' : 'expense') as 'income' | 'expense'

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const rows = await db
    .select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      total: sum(sql`${transactions.amount}::numeric`),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, type),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`,
    ))
    .groupBy(categories.id, categories.name, categories.color)

  const grandTotal = rows.reduce((acc, r) => acc + Number(r.total ?? 0), 0)

  return {
    type,
    total: grandTotal.toFixed(2),
    items: rows.map(r => ({
      categoryId: r.categoryId,
      name: r.name,
      color: r.color,
      amount: Number(r.total ?? 0).toFixed(2),
      percentage: grandTotal === 0 ? 0 : Number(((Number(r.total ?? 0) / grandTotal) * 100).toFixed(1)),
    })),
  }
})
