import { and, eq, gte, sql, sum } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'
import type { MonthlyTrends } from '#shared/types/dashboard'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default defineEventHandler(async (event): Promise<MonthlyTrends> => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = session.user.id
  const now = new Date()

  // Build 6-month skeleton (oldest first)
  const skeleton: Array<{ month: number; year: number }> = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    skeleton.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }

  const first = skeleton[0]!
  const firstDay = new Date(first.year, first.month - 1, 1).toISOString().slice(0, 10)

  const rows = await db.select({
    month: sql<number>`EXTRACT(MONTH FROM ${transactions.date})::int`,
    year: sql<number>`EXTRACT(YEAR FROM ${transactions.date})::int`,
    income: sum(sql`CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END`),
    expenses: sum(sql`CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END`),
  })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, firstDay),
    ))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${transactions.date})`,
      sql`EXTRACT(MONTH FROM ${transactions.date})`,
    )

  const map = new Map(rows.map(r => [`${r.year}-${r.month}`, r]))

  return skeleton.map(({ month, year }) => {
    const row = map.get(`${year}-${month}`)
    return {
      month: MONTH_LABELS[month - 1] ?? '',
      year,
      income: row?.income ?? '0',
      expenses: row?.expenses ?? '0',
    }
  })
})
