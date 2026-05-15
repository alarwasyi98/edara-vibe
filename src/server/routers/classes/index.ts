import { and, asc, count, eq, inArray } from 'drizzle-orm'
import { authorized } from '../authorized'
import { requireRole, withActivityLog } from '../middlewares'
import { classes } from '@/server/db/schema/classes'
import { academicYears } from '@/server/db/schema/academic-years'
import {
  enrollments,
  enrollmentStatusHistory,
} from '@/server/db/schema/enrollments'
import { students } from '@/server/db/schema/students'
import { teachers } from '@/server/db/schema/teachers'
import { idParam, badRequest, notFound } from '@/server/shared'
import {
  createClassSchema,
  listClassesSchema,
  massPromotionSchema,
  updateClassSchema,
  type CreateClassInput,
} from '@/lib/validators/classes'

const tenantAdmin = authorized.use(
  requireRole(['super_admin', 'kepala_sekolah']),
)

type ScopedContext = {
  schoolId: string
  unitId: string
}

type AcademicYearRecord = typeof academicYears.$inferSelect
type ClassRecord = typeof classes.$inferSelect

function normalizeHomeroomTeacherId(
  homeroomTeacherId: string | null | undefined,
): string | null {
  return homeroomTeacherId ?? null
}

async function getAcademicYearOrThrow(
  tx: typeof authorized['~orpc']['context']['tx'],
  scope: ScopedContext,
  academicYearId: string,
): Promise<AcademicYearRecord> {
  const academicYear = await tx.query.academicYears.findFirst({
    where: and(
      eq(academicYears.id, academicYearId),
      eq(academicYears.schoolId, scope.schoolId),
      eq(academicYears.unitId, scope.unitId),
    ),
  })

  if (!academicYear) {
    notFound('Academic year')
  }

  return academicYear
}

async function getActiveAcademicYear(
  tx: typeof authorized['~orpc']['context']['tx'],
  scope: ScopedContext,
): Promise<AcademicYearRecord | null> {
  return await tx.query.academicYears.findFirst({
    where: and(
      eq(academicYears.schoolId, scope.schoolId),
      eq(academicYears.unitId, scope.unitId),
      eq(academicYears.isActive, true),
    ),
  })
}

async function validateHomeroomTeacher(
  tx: typeof authorized['~orpc']['context']['tx'],
  scope: ScopedContext,
  homeroomTeacherId: string | null,
): Promise<void> {
  if (!homeroomTeacherId) {
    return
  }

  const teacher = await tx.query.teachers.findFirst({
    where: and(
      eq(teachers.id, homeroomTeacherId),
      eq(teachers.schoolId, scope.schoolId),
      eq(teachers.unitId, scope.unitId),
      eq(teachers.isActive, true),
    ),
  })

  if (!teacher) {
    badRequest('Wali kelas tidak ditemukan atau tidak aktif')
  }
}

async function getClassOrThrow(
  tx: typeof authorized['~orpc']['context']['tx'],
  scope: ScopedContext,
  classId: string,
): Promise<ClassRecord> {
  const classRecord = await tx.query.classes.findFirst({
    where: and(
      eq(classes.id, classId),
      eq(classes.schoolId, scope.schoolId),
      eq(classes.unitId, scope.unitId),
    ),
  })

  if (!classRecord) {
    notFound('Class')
  }

  return classRecord
}

async function validateClassInput(
  tx: typeof authorized['~orpc']['context']['tx'],
  scope: ScopedContext,
  input: CreateClassInput,
): Promise<void> {
  await getAcademicYearOrThrow(tx, scope, input.academicYearId)
  await validateHomeroomTeacher(
    tx,
    scope,
    normalizeHomeroomTeacherId(input.homeroomTeacherId),
  )
}

export const listClasses = authorized
  .input(listClassesSchema)
  .handler(async ({ input, context }) => {
    const scope = {
      schoolId: context.schoolId,
      unitId: context.unitId!,
    }

    const academicYear = input.academicYearId
      ? await getAcademicYearOrThrow(context.tx, scope, input.academicYearId)
      : await getActiveAcademicYear(context.tx, scope)

    if (!academicYear) {
      return {
        academicYear: null,
        totalClasses: 0,
        grades: [],
      }
    }

    const classRows = await context.tx
      .select({
        id: classes.id,
        schoolId: classes.schoolId,
        unitId: classes.unitId,
        academicYearId: classes.academicYearId,
        name: classes.name,
        gradeLevel: classes.gradeLevel,
        homeroomTeacherId: classes.homeroomTeacherId,
        homeroomTeacherName: teachers.namaLengkap,
        capacity: classes.capacity,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .leftJoin(
        teachers,
        and(
          eq(teachers.id, classes.homeroomTeacherId),
          eq(teachers.schoolId, scope.schoolId),
          eq(teachers.unitId, scope.unitId),
        ),
      )
      .where(
        and(
          eq(classes.schoolId, scope.schoolId),
          eq(classes.unitId, scope.unitId),
          eq(classes.academicYearId, academicYear.id),
        ),
      )
      .orderBy(asc(classes.gradeLevel), asc(classes.name))

    const classIds = classRows.map((row) => row.id)

    const enrollmentCounts =
      classIds.length === 0
        ? []
        : await context.tx
            .select({
              classId: enrollments.classId,
              activeStudentCount: count(),
            })
            .from(enrollments)
            .where(
              and(
                eq(enrollments.schoolId, scope.schoolId),
                eq(enrollments.unitId, scope.unitId),
                eq(enrollments.academicYearId, academicYear.id),
                eq(enrollments.status, 'active'),
                inArray(enrollments.classId, classIds),
              ),
            )
            .groupBy(enrollments.classId)

    const countByClassId = new Map(
      enrollmentCounts.map((row) => [row.classId, row.activeStudentCount]),
    )

    const groupedGrades = new Map<
      number,
      {
        gradeLevel: number
        totalClasses: number
        totalStudents: number
        classes: Array<{
          id: string
          schoolId: string
          unitId: string
          academicYearId: string
          name: string
          gradeLevel: number
          homeroomTeacherId: string | null
          homeroomTeacherName: string | null
          capacity: number
          activeStudentCount: number
          remainingCapacity: number
          createdAt: Date
        }>
      }
    >()

    for (const row of classRows) {
      const activeStudentCount = countByClassId.get(row.id) ?? 0
      const existingGrade = groupedGrades.get(row.gradeLevel)
      const classSummary = {
        ...row,
        homeroomTeacherId: row.homeroomTeacherId ?? null,
        homeroomTeacherName: row.homeroomTeacherName ?? null,
        activeStudentCount,
        remainingCapacity: row.capacity - activeStudentCount,
      }

      if (existingGrade) {
        existingGrade.totalClasses += 1
        existingGrade.totalStudents += activeStudentCount
        existingGrade.classes.push(classSummary)
        continue
      }

      groupedGrades.set(row.gradeLevel, {
        gradeLevel: row.gradeLevel,
        totalClasses: 1,
        totalStudents: activeStudentCount,
        classes: [classSummary],
      })
    }

    return {
      academicYear,
      totalClasses: classRows.length,
      grades: Array.from(groupedGrades.values()).sort(
        (left, right) => left.gradeLevel - right.gradeLevel,
      ),
    }
  })

export const getClassById = authorized
  .input(idParam)
  .handler(async ({ input, context }) => {
    const scope = {
      schoolId: context.schoolId,
      unitId: context.unitId!,
    }

    const classRecord = await context.tx
      .select({
        id: classes.id,
        schoolId: classes.schoolId,
        unitId: classes.unitId,
        academicYearId: classes.academicYearId,
        academicYearName: academicYears.name,
        academicYearIsActive: academicYears.isActive,
        name: classes.name,
        gradeLevel: classes.gradeLevel,
        homeroomTeacherId: classes.homeroomTeacherId,
        homeroomTeacherName: teachers.namaLengkap,
        capacity: classes.capacity,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .innerJoin(
        academicYears,
        and(
          eq(academicYears.id, classes.academicYearId),
          eq(academicYears.schoolId, scope.schoolId),
          eq(academicYears.unitId, scope.unitId),
        ),
      )
      .leftJoin(
        teachers,
        and(
          eq(teachers.id, classes.homeroomTeacherId),
          eq(teachers.schoolId, scope.schoolId),
          eq(teachers.unitId, scope.unitId),
        ),
      )
      .where(
        and(
          eq(classes.id, input.id),
          eq(classes.schoolId, scope.schoolId),
          eq(classes.unitId, scope.unitId),
        ),
      )

    const detail = classRecord[0]

    if (!detail) {
      notFound('Class')
    }

    const studentRows = await context.tx
      .select({
        enrollmentId: enrollments.id,
        studentId: students.id,
        nis: students.nis,
        nisn: students.nisn,
        namaLengkap: students.namaLengkap,
        namaWali: students.namaWali,
        nomorHpWali: students.nomorHpWali,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(
        students,
        and(
          eq(students.id, enrollments.studentId),
          eq(students.schoolId, scope.schoolId),
          eq(students.unitId, scope.unitId),
        ),
      )
      .where(
        and(
          eq(enrollments.schoolId, scope.schoolId),
          eq(enrollments.unitId, scope.unitId),
          eq(enrollments.classId, detail.id),
          eq(enrollments.academicYearId, detail.academicYearId),
          eq(enrollments.status, 'active'),
        ),
      )
      .orderBy(asc(students.namaLengkap))

    return {
      ...detail,
      homeroomTeacherId: detail.homeroomTeacherId ?? null,
      homeroomTeacherName: detail.homeroomTeacherName ?? null,
      activeStudentCount: studentRows.length,
      remainingCapacity: detail.capacity - studentRows.length,
      students: studentRows,
    }
  })

export const createClass = tenantAdmin
  .use(
    withActivityLog({
      action: 'class.created',
      entityType: 'class',
      description: 'Menambahkan data kelas',
    }),
  )
  .input(createClassSchema)
  .handler(async ({ input, context }) => {
    const scope = {
      schoolId: context.schoolId,
      unitId: context.unitId!,
    }

    await validateClassInput(context.tx, scope, input)

    const [created] = await context.tx
      .insert(classes)
      .values({
        schoolId: scope.schoolId,
        unitId: scope.unitId,
        academicYearId: input.academicYearId,
        name: input.name,
        gradeLevel: input.gradeLevel,
        homeroomTeacherId: normalizeHomeroomTeacherId(input.homeroomTeacherId),
        capacity: input.capacity,
      })
      .returning()

    return created
  })

export const updateClass = tenantAdmin
  .use(
    withActivityLog({
      action: 'class.updated',
      entityType: 'class',
      description: 'Memperbarui data kelas',
    }),
  )
  .input(idParam.merge(updateClassSchema))
  .handler(async ({ input, context }) => {
    const scope = {
      schoolId: context.schoolId,
      unitId: context.unitId!,
    }

    const { id, ...data } = input

    const existing = await getClassOrThrow(context.tx, scope, id)

    if (existing.academicYearId !== data.academicYearId) {
      badRequest('Tahun ajaran kelas tidak dapat diubah setelah kelas dibuat')
    }

    await validateClassInput(context.tx, scope, data)

    const [updated] = await context.tx
      .update(classes)
      .set({
        academicYearId: data.academicYearId,
        name: data.name,
        gradeLevel: data.gradeLevel,
        homeroomTeacherId: normalizeHomeroomTeacherId(data.homeroomTeacherId),
        capacity: data.capacity,
      })
      .where(
        and(
          eq(classes.id, id),
          eq(classes.schoolId, scope.schoolId),
          eq(classes.unitId, scope.unitId),
        ),
      )
      .returning()

    return updated
  })

export const massPromotion = tenantAdmin
  .use(
    withActivityLog({
      action: 'class.mass_promotion.executed',
      entityType: 'class',
      description: 'Menjalankan kenaikan kelas massal',
    }),
  )
  .input(massPromotionSchema)
  .handler(async ({ input, context }) => {
    const scope = {
      schoolId: context.schoolId,
      unitId: context.unitId!,
    }

    const sourceClass = await getClassOrThrow(
      context.tx,
      scope,
      input.sourceClassId,
    )
    const changedBy = context.user.name ?? context.user.email
    const targetClassIds = Array.from(
      new Set(input.promotions.map((promotion) => promotion.targetClassId)),
    )
    const sourceStudentIds = input.promotions.map((promotion) => promotion.studentId)

    return await context.tx.transaction(async (tx) => {
      const targetAcademicYear = await getAcademicYearOrThrow(
        tx,
        scope,
        input.targetAcademicYearId,
      )

      if (sourceClass.academicYearId === targetAcademicYear.id) {
        badRequest('Tahun ajaran tujuan harus berbeda dari kelas asal')
      }

      const targetClasses = await tx.query.classes.findMany({
        where: and(
          eq(classes.schoolId, scope.schoolId),
          eq(classes.unitId, scope.unitId),
          eq(classes.academicYearId, targetAcademicYear.id),
          inArray(classes.id, targetClassIds),
        ),
      })

      if (targetClasses.length !== targetClassIds.length) {
        badRequest(
          'Sebagian kelas tujuan tidak ditemukan pada tahun ajaran tujuan',
        )
      }

      const sourceEnrollments = await tx.query.enrollments.findMany({
        where: and(
          eq(enrollments.schoolId, scope.schoolId),
          eq(enrollments.unitId, scope.unitId),
          eq(enrollments.classId, sourceClass.id),
          eq(enrollments.academicYearId, sourceClass.academicYearId),
          eq(enrollments.status, 'active'),
          inArray(enrollments.studentId, sourceStudentIds),
        ),
      })

      if (sourceEnrollments.length !== sourceStudentIds.length) {
        badRequest('Sebagian siswa tidak memiliki enrollment aktif di kelas asal')
      }

      const existingTargetEnrollments = await tx.query.enrollments.findMany({
        where: and(
          eq(enrollments.schoolId, scope.schoolId),
          eq(enrollments.unitId, scope.unitId),
          eq(enrollments.academicYearId, targetAcademicYear.id),
          inArray(enrollments.studentId, sourceStudentIds),
        ),
      })

      if (existingTargetEnrollments.length > 0) {
        badRequest(
          'Sebagian siswa sudah memiliki enrollment pada tahun ajaran tujuan',
        )
      }

      const enrollmentByStudentId = new Map(
        sourceEnrollments.map((enrollment) => [enrollment.studentId, enrollment]),
      )

      const sourceEnrollmentIds = sourceEnrollments.map((enrollment) => enrollment.id)

      await tx
        .update(enrollments)
        .set({ status: 'promoted' })
        .where(inArray(enrollments.id, sourceEnrollmentIds))

      await tx.insert(enrollmentStatusHistory).values(
        input.promotions.map((promotion) => {
          const sourceEnrollment = enrollmentByStudentId.get(promotion.studentId)

          if (!sourceEnrollment) {
            badRequest('Data enrollment sumber tidak lengkap')
          }

          return {
            enrollmentId: sourceEnrollment.id,
            fromStatus: 'active' as const,
            toStatus: 'promoted' as const,
            changedBy,
            reason: `Kenaikan kelas massal ke tahun ajaran ${targetAcademicYear.name}`,
            metadata: {
              fromClassId: sourceClass.id,
              toClassId: promotion.targetClassId,
              fromAcademicYearId: sourceClass.academicYearId,
              toAcademicYearId: targetAcademicYear.id,
            },
          }
        }),
      )

      await tx.insert(enrollments).values(
        input.promotions.map((promotion) => ({
          schoolId: scope.schoolId,
          unitId: scope.unitId,
          studentId: promotion.studentId,
          classId: promotion.targetClassId,
          academicYearId: targetAcademicYear.id,
          status: 'active' as const,
        })),
      )

      return {
        sourceClassId: sourceClass.id,
        targetAcademicYearId: targetAcademicYear.id,
        promotedStudentCount: input.promotions.length,
        targetClassIds,
      }
    })
  })
