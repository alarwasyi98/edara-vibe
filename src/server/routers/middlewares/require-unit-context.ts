// Neon HTTP is stateless — SET LOCAL only persists within a transaction.
// This middleware wraps downstream in db.transaction() so RLS vars stay active. (ADR-02)

import { ORPCError } from '@orpc/server'
import { sql } from 'drizzle-orm'
import { base } from '../context'
import { db } from '@/server/db'
import { resolveAssignment } from '../helpers/assignment'

export const requireUnitContextMiddleware = base.middleware(
  async ({ context, next }) => {
    const { user } = context as { user: { id: string } }

    const assignment = await resolveAssignment(user.id)

    if (!assignment.schoolId || !assignment.role) {
      throw new ORPCError(
        'FORBIDDEN',
        'No active school assignment found. Contact your administrator.',
      )
    }

    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.current_school', ${assignment.schoolId}, true)`,
      )

      if (assignment.unitId) {
        await tx.execute(
          sql`SELECT set_config('app.current_unit', ${assignment.unitId}, true)`,
        )
      }

      return next({
        context: {
          schoolId: assignment.schoolId,
          unitId: assignment.unitId,
          role: assignment.role,
          assignmentId: assignment.assignmentId,
          tx,
        },
      })
    })
  },
)
