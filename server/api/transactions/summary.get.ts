import { and, count, eq, sql, sum } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const month = query.month ? Number(query.month) : null
  const year = query.year ? Number(query.year) : null

  const baseConditions = [eq(transactions.userId, session.user.id)]

  if (month && year) {
    baseConditions.push(sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`)
    baseConditions.push(sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`)
  }
  else if (year) {
    baseConditions.push(sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`)
  }

  const [totals] = await db
    .select({
      totalTransactions: count(),
      totalIncome: sum(
        sql`CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END`,
      ),
      totalExpenses: sum(
        sql`CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END`,
      ),
    })
    .from(transactions)
    .where(and(...baseConditions))

  const totalIncome = totals?.totalIncome ?? '0'
  const totalExpenses = totals?.totalExpenses ?? '0'
  const net = (Number(totalIncome) - Number(totalExpenses)).toFixed(2)

  return {
    totalTransactions: totals?.totalTransactions ?? 0,
    totalIncome,
    totalExpenses,
    net,
  }
})
