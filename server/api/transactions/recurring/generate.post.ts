import { generateRecurringSchema } from '#shared/schemas/transaction'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/database'
import { recurringGenerations, transactions } from '~~/server/database/schema'

function getTargetDate(sourceDate: string, targetMonth: number, targetYear: number): string {
  const sourceDay = Number(sourceDate.split('-')[2])
  const lastDay = new Date(targetYear, targetMonth, 0).getDate()
  const day = Math.min(sourceDay, lastDay)
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, generateRecurringSchema.parse)
  const { sourceMonth, sourceYear } = body

  const targetMonth = sourceMonth === 12 ? 1 : sourceMonth + 1
  const targetYear = sourceMonth === 12 ? sourceYear + 1 : sourceYear

  const existingGuard = await db.query.recurringGenerations.findFirst({
    where: and(
      eq(recurringGenerations.userId, session.user.id),
      eq(recurringGenerations.targetMonth, targetMonth),
      eq(recurringGenerations.targetYear, targetYear),
    ),
  })

  if (existingGuard) {
    throw createError({ statusCode: 409, statusMessage: 'Recurring transactions already generated for this period' })
  }

  const recurringTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.user.id),
      eq(transactions.isRecurring, true),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${sourceMonth}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${sourceYear}`,
    ),
  })

  if (recurringTransactions.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No recurring transactions found for this period' })
  }

  await db.transaction(async (tx) => {
    await tx.insert(recurringGenerations).values({
      userId: session.user!.id,
      targetMonth,
      targetYear,
    })

    await tx.insert(transactions).values(
      recurringTransactions.map(t => ({
        userId: session.user!.id,
        categoryId: t.categoryId,
        amount: '0',
        description: t.description,
        type: t.type,
        isRecurring: true,
        date: getTargetDate(t.date, targetMonth, targetYear),
      })),
    )
  })

  setResponseStatus(event, 201)
  return { count: recurringTransactions.length }
})
