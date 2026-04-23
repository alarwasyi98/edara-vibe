import { eq } from 'drizzle-orm'
import { authorized } from '../authorized'
import { db } from '@/server/db'
import { userSchoolAssignments } from '@/server/db/schema/users'

export const listUsersWithAssignments = authorized.handler(async () => {
  const assignments = await db.query.userSchoolAssignments.findMany({
    with: {
      school: true,
      unit: true,
    },
  })
  return assignments
})

export const assignUserToSchool = authorized
  .inputValidator((data: {
    userId: string
    schoolId: string
    unitId?: string
    role: 'super_admin' | 'kepala_sekolah' | 'admin_tu' | 'bendahara'
  }) => data)
  .handler(async ({ data }) => {
    return await db.insert(userSchoolAssignments).values({
      userId: data.userId,
      schoolId: data.schoolId,
      unitId: data.unitId,
      role: data.role,
    })
  })

export const toggleAssignment = authorized
  .inputValidator((data: { assignmentId: string; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    return await db.update(userSchoolAssignments)
      .set({ isActive: data.isActive })
      .where(eq(userSchoolAssignments.id, data.assignmentId))
  })