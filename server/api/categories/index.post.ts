import { categorySchema } from '#shared/schemas/category'
import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { categories } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, categorySchema.parse)

  const existingCategory = await db.query.categories.findFirst({
    where: and(
      eq(categories.name, body.name),
      eq(categories.type, body.type),
      eq(categories.userId, session.user.id),
    ),
  })

  if (existingCategory) {
    throw createError({ statusCode: 409, statusMessage: 'Category with the same name already exists' })
  }

  const [category] = await db.insert(categories).values({
    ...body,
    userId: session.user.id,
  }).returning()

  if (!category) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create category' })
  }

  setResponseStatus(event, 201)
  return category
})
