import { db } from '@/server/db'
import { userSchoolAssignments } from '@/server/db/schema/users'
import { eq, and, asc } from 'drizzle-orm'

export type AssignmentResolution = {
  userId: string
  schoolId: string | null
  unitId: string | null
  role: 'super_admin' | 'kepala_sekolah' | 'admin_tu' | 'bendahara' | null
  assignmentId: string | null
}

export async function resolveAssignment(userId: string): Promise<AssignmentResolution> {
  const assignments = await db.query.userSchoolAssignments.findMany({
    where: and(
      eq(userSchoolAssignments.userId, userId),
      eq(userSchoolAssignments.isActive, true)
    ),
    orderBy: [asc(userSchoolAssignments.assignedAt)],
  })

  if (assignments.length === 0) {
    return {
      userId,
      schoolId: null,
      unitId: null,
      role: null,
      assignmentId: null,
    }
  }

  const assignment = assignments[0]

  return {
    userId,
    schoolId: assignment.schoolId,
    unitId: assignment.unitId,
    role: assignment.role,
    assignmentId: assignment.id,
  }
}