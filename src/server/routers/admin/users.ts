import { eq } from 'drizzle-orm'
import { authorized } from '../authorized'
import { requireRole } from '../middlewares'
import { userSchoolAssignments } from '@/server/db/schema/users'
import * as z from 'zod'

const adminAuthorized = authorized.use(requireRole(['super_admin', 'kepala_sekolah']))

export const listUsersWithAssignments = adminAuthorized.handler(
  async ({ context }) => {
    return await context.tx.query.userSchoolAssignments.findMany({
      with: {
        school: true,
        unit: true,
      },
    })
  },
)

export const assignUserToSchool = adminAuthorized
  .input(
    z.object({
      userId: z.string(),
      schoolId: z.string(),
      unitId: z.string().optional(),
      role: z.enum(['super_admin', 'kepala_sekolah', 'admin_tu', 'bendahara']),
    }),
  )
  .handler(async ({ input, context }) => {
    return await context.tx.insert(userSchoolAssignments).values({
      userId: input.userId,
      schoolId: input.schoolId,
      unitId: input.unitId,
      role: input.role,
    })
  })

export const toggleAssignment = adminAuthorized
  .input(z.object({ assignmentId: z.string(), isActive: z.boolean() }))
  .handler(async ({ input, context }) => {
    return await context.tx
      .update(userSchoolAssignments)
      .set({ isActive: input.isActive })
      .where(eq(userSchoolAssignments.id, input.assignmentId))
  })
