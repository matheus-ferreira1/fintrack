import type { TransactionType } from '#shared/types/transaction'
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { db } from '~~/server/database'
import { transactions } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 10))
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const type = typeof query.type === 'string' && ['income', 'expense'].includes(query.type)
    ? query.type as TransactionType
    : null
  const sort = query.sort === 'oldest' ? 'oldest' : 'newest'
  const month = query.month ? Number(query.month) : null
  const year = query.year ? Number(query.year) : null

  const conditions = [eq(transactions.userId, session.user.id)]

  if (search) {
    conditions.push(ilike(transactions.description, `%${search}%`))
  }

  if (type) {
    conditions.push(eq(transactions.type, type))
  }

  if (month && year) {
    conditions.push(sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`)
    conditions.push(sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`)
  }
  else if (year) {
    conditions.push(sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`)
  }

  const whereClause = and(...conditions)
  const orderBy = sort === 'oldest' ? asc(transactions.date) : desc(transactions.date)

  const [result] = await db
    .select({ total: count() })
    .from(transactions)
    .where(whereClause)

  const total = result?.total ?? 0

  const data = await db.query.transactions.findMany({
    where: whereClause,
    with: { category: true },
    orderBy,
    limit: perPage,
    offset: (page - 1) * perPage,
  })

  return {
    data,
    total,
    page,
    perPage,
  }
})
