// Centralized audit logging middleware (ADR-05).
// Post-hook pattern: procedure executes first, log written on success only.

import { base } from '../context'
import { db } from '@/server/db'
import { activityLogs } from '@/server/db/schema/logs'

export type ActivityLogMeta = {
  action: string
  entityType: string
  entityId?: string
  description: string
  metadata?: Record<string, unknown>
}

export function withActivityLog(meta: Omit<ActivityLogMeta, 'description'> & { description?: string }) {
  return base.middleware(async ({ context, next }) => {
    const {
      user,
      schoolId,
      unitId,
    } = context as {
      user: { id: string; name: string | null }
      schoolId: string
      unitId: string | null
    }

    const result = await next()

    try {
      await db.insert(activityLogs).values({
        schoolId,
        unitId,
        actorId: user.id,
        actorName: user.name ?? 'Unknown',
        action: meta.action,
        entityType: meta.entityType,
        entityId: meta.entityId,
        description: meta.description ?? `${meta.action} by ${user.name ?? 'Unknown'}`,
        metadata: meta.metadata ?? null,
      })
    } catch (err) {
      console.error('[withActivityLog] Failed to write activity log:', err)
    }

    return result
  })
}
