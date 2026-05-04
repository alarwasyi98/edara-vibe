import { eq, desc, count, sql } from 'drizzle-orm'
import { authorized } from '../authorized'
import { activityLogs } from '@/server/db/schema/logs'
import { paginationSchema, paginationToOffset, paginate } from '@/server/shared'

// ── list ─────────────────────────────────────────────────────

export const listActivityLogs = authorized
  .input(paginationSchema)
  .handler(async ({ input, context }) => {
    const unitId = context.unitId!
    const { limit, offset } = paginationToOffset(input)

    const [totalResult] = await context.tx
      .select({ count: count() })
      .from(activityLogs)
      .where(eq(activityLogs.unitId, unitId))

    const total = totalResult?.count ?? 0

    const logs = await context.tx
      .select({
        id: activityLogs.id,
        actorName: activityLogs.actorName,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        description: activityLogs.description,
        createdAt: activityLogs.createdAt,
        day: sql<string>`date(${activityLogs.createdAt})`,
      })
      .from(activityLogs)
      .where(eq(activityLogs.unitId, unitId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset)

    const groupedByDay = logs.reduce(
      (acc, log) => {
        const day = log.day
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day]!.push({
          id: log.id,
          actorName: log.actorName,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          description: log.description,
          createdAt: log.createdAt,
        })
        return acc
      },
      {} as Record<string, typeof logs>,
    )

    return paginate(
      Object.entries(groupedByDay).map(([day, items]) => ({ day, items })),
      total,
      input,
    )
  })
