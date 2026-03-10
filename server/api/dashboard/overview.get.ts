import { and, eq, lte, sql, sum } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'
import type { DashboardOverview } from '#shared/types/dashboard'

function calcChangePercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Number(((current - previous) / Math.abs(previous) * 100).toFixed(1))
}

export default defineEventHandler(async (event): Promise<DashboardOverview> => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = session.user.id
  const now = new Date()
  const currMonth = now.getMonth() + 1
  const currYear = now.getFullYear()
  const prevMonth = currMonth === 1 ? 12 : currMonth - 1
  const prevYear = currMonth === 1 ? currYear - 1 : currYear

  const lastDayOfCurrMonth = new Date(currYear, currMonth, 0).toISOString().slice(0, 10)
  const lastDayOfPrevMonth = new Date(prevYear, prevMonth, 0).toISOString().slice(0, 10)

  const incomeCase = (t: typeof transactions) =>
    sql`CASE WHEN ${t.type} = 'income' THEN ${t.amount}::numeric ELSE 0 END`
  const expenseCase = (t: typeof transactions) =>
    sql`CASE WHEN ${t.type} = 'expense' THEN ${t.amount}::numeric ELSE 0 END`

  const [currMonthly, prevMonthly, currBalance, prevBalance] = await Promise.all([
    db.select({
      income: sum(incomeCase(transactions)),
      expenses: sum(expenseCase(transactions)),
    }).from(transactions).where(and(
      eq(transactions.userId, userId),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${currMonth}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${currYear}`,
    )),

    db.select({
      income: sum(incomeCase(transactions)),
      expenses: sum(expenseCase(transactions)),
    }).from(transactions).where(and(
      eq(transactions.userId, userId),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${prevMonth}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${prevYear}`,
    )),

    db.select({
      income: sum(incomeCase(transactions)),
      expenses: sum(expenseCase(transactions)),
    }).from(transactions).where(and(
      eq(transactions.userId, userId),
      lte(transactions.date, lastDayOfCurrMonth),
    )),

    db.select({
      income: sum(incomeCase(transactions)),
      expenses: sum(expenseCase(transactions)),
    }).from(transactions).where(and(
      eq(transactions.userId, userId),
      lte(transactions.date, lastDayOfPrevMonth),
    )),
  ])

  const currIncome = Number(currMonthly[0]?.income ?? 0)
  const currExpenses = Number(currMonthly[0]?.expenses ?? 0)
  const prevIncome = Number(prevMonthly[0]?.income ?? 0)
  const prevExpenses = Number(prevMonthly[0]?.expenses ?? 0)
  const currSavings = currIncome - currExpenses
  const prevSavings = prevIncome - prevExpenses
  const currBal = Number(currBalance[0]?.income ?? 0) - Number(currBalance[0]?.expenses ?? 0)
  const prevBal = Number(prevBalance[0]?.income ?? 0) - Number(prevBalance[0]?.expenses ?? 0)

  return {
    balance: {
      current: currBal.toFixed(2),
      previous: prevBal.toFixed(2),
      changePercent: calcChangePercent(currBal, prevBal),
    },
    monthlyIncome: {
      current: currIncome.toFixed(2),
      previous: prevIncome.toFixed(2),
      changePercent: calcChangePercent(currIncome, prevIncome),
    },
    monthlyExpenses: {
      current: currExpenses.toFixed(2),
      previous: prevExpenses.toFixed(2),
      changePercent: calcChangePercent(currExpenses, prevExpenses),
    },
    monthlySavings: {
      current: currSavings.toFixed(2),
      previous: prevSavings.toFixed(2),
      changePercent: calcChangePercent(currSavings, prevSavings),
    },
  }
})
