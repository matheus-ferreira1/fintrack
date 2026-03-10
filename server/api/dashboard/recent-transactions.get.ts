import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'
import type { RecentTransactions } from '#shared/types/dashboard'

export default defineEventHandler(async (event): Promise<RecentTransactions> => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = session.user.id

  const rows = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: { category: { columns: { name: true, color: true } } },
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit: 10,
  })

  return rows.map(r => ({
    id: r.id,
    description: r.description,
    amount: r.amount,
    type: r.type,
    date: r.date,
    isRecurring: r.isRecurring,
    category: r.category,
  }))
})
