import type { RecurringPreview } from '#shared/types/transaction'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/database'
import { recurringGenerations, transactions } from '~~/server/database/schema'

function getTargetDate(sourceDate: string, targetMonth: number, targetYear: number): string {
  const sourceDay = Number(sourceDate.split('-')[2])
  const lastDay = new Date(targetYear, targetMonth, 0).getDate()
  const day = Math.min(sourceDay, lastDay)
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default defineEventHandler(async (event): Promise<RecurringPreview> => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const sourceMonth = Number(query.month)
  const sourceYear = Number(query.year)

  if (!sourceMonth || !sourceYear || sourceMonth < 1 || sourceMonth > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid month or year' })
  }

  const targetMonth = sourceMonth === 12 ? 1 : sourceMonth + 1
  const targetYear = sourceMonth === 12 ? sourceYear + 1 : sourceYear

  const guardRow = await db.query.recurringGenerations.findFirst({
    where: and(
      eq(recurringGenerations.userId, session.user.id),
      eq(recurringGenerations.targetMonth, targetMonth),
      eq(recurringGenerations.targetYear, targetYear),
    ),
  })

  const recurringTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      eq(transactions.isRecurring, true),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${sourceMonth}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${sourceYear}`,
    ),
    with: { category: true },
  })

  return {
    transactions: recurringTransactions.map(t => ({
      description: t.description,
      type: t.type,
      categoryName: t.category.name,
      categoryColor: t.category.color,
      sourceDate: t.date,
      targetDate: getTargetDate(t.date, targetMonth, targetYear),
    })),
    alreadyGenerated: !!guardRow,
    targetMonth,
    targetYear,
  }
})
