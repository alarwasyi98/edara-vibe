import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from 'drizzle-orm'
import { authorized } from '../authorized'
import { requireRole, withActivityLog } from '../middlewares'
import { teachers } from '@/server/db/schema/teachers'
import { idParam, notFound, paginate, paginationToOffset } from '@/server/shared'
import {
  createTeacherSchema,
  listTeachersSchema,
  updateTeacherSchema,
} from '@/lib/validators/teachers'

const tenantAdmin = authorized.use(
  requireRole(['super_admin', 'kepala_sekolah']),
)

function buildTeacherWhereClause(
  schoolId: string,
  unitId: string,
  input: {
    search?: string
    statusKepegawaian: string[]
    mataPelajaran: string[]
    includeInactive: boolean
  },
) {
  const conditions = [
    eq(teachers.schoolId, schoolId),
    eq(teachers.unitId, unitId),
    ...(input.includeInactive ? [] : [eq(teachers.isActive, true)]),
    ...(input.statusKepegawaian.length > 0
      ? [inArray(teachers.statusKepegawaian, input.statusKepegawaian)]
      : []),
  ]

  if (input.search) {
    const pattern = `%${input.search}%`
    conditions.push(
      or(
        ilike(teachers.namaLengkap, pattern),
        ilike(teachers.nik, pattern),
        ilike(teachers.nip, pattern),
      )!,
    )
  }

  if (input.mataPelajaran.length > 0) {
    const subjectsArray = sql.join(
      input.mataPelajaran.map((subject) => sql`${subject}`),
      sql`, `,
    )

    conditions.push(
      sql<boolean>`COALESCE(${teachers.mataPelajaran}, '[]'::jsonb) ?| ARRAY[${subjectsArray}]`,
    )
  }

  return and(...conditions)
}

export const listTeachers = authorized
  .input(listTeachersSchema)
  .handler(async ({ input, context }) => {
    const unitId = context.unitId!
    const whereClause = buildTeacherWhereClause(context.schoolId, unitId, input)
    const { limit, offset } = paginationToOffset(input)

    const [totalResult] = await context.tx
      .select({ count: count() })
      .from(teachers)
      .where(whereClause)

    const rows = await context.tx
      .select({
        id: teachers.id,
        schoolId: teachers.schoolId,
        unitId: teachers.unitId,
        nip: teachers.nip,
        nik: teachers.nik,
        namaLengkap: teachers.namaLengkap,
        tempatLahir: teachers.tempatLahir,
        tanggalLahir: teachers.tanggalLahir,
        jenisKelamin: teachers.jenisKelamin,
        nomorHp: teachers.nomorHp,
        alamat: teachers.alamat,
        statusKepegawaian: teachers.statusKepegawaian,
        mataPelajaran: teachers.mataPelajaran,
        tanggalBergabung: teachers.tanggalBergabung,
        photoUrl: teachers.photoUrl,
        isActive: teachers.isActive,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
      })
      .from(teachers)
      .where(whereClause)
      .orderBy(desc(teachers.isActive), asc(teachers.namaLengkap))
      .limit(limit)
      .offset(offset)

    return paginate(rows, totalResult?.count ?? 0, input)
  })

export const getTeacherById = authorized
  .input(idParam)
  .handler(async ({ input, context }) => {
    const teacher = await context.tx.query.teachers.findFirst({
      where: and(
        eq(teachers.id, input.id),
        eq(teachers.schoolId, context.schoolId),
        eq(teachers.unitId, context.unitId!),
      ),
    })

    if (!teacher) {
      notFound('Teacher')
    }

    return teacher
  })

export const createTeacher = tenantAdmin
  .use(
    withActivityLog({
      action: 'teacher.created',
      entityType: 'teacher',
      description: 'Menambahkan data guru',
    }),
  )
  .input(createTeacherSchema)
  .handler(async ({ input, context }) => {
    const [created] = await context.tx
      .insert(teachers)
      .values({
        ...input,
        schoolId: context.schoolId,
        unitId: context.unitId!,
      })
      .returning()

    return created
  })

export const updateTeacher = tenantAdmin
  .use(
    withActivityLog({
      action: 'teacher.updated',
      entityType: 'teacher',
      description: 'Memperbarui data guru',
    }),
  )
  .input(idParam.merge(updateTeacherSchema))
  .handler(async ({ input, context }) => {
    const { id, ...data } = input

    const existing = await context.tx.query.teachers.findFirst({
      where: and(
        eq(teachers.id, id),
        eq(teachers.schoolId, context.schoolId),
        eq(teachers.unitId, context.unitId!),
      ),
    })

    if (!existing) {
      notFound('Teacher')
    }

    const [updated] = await context.tx
      .update(teachers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teachers.id, id),
          eq(teachers.schoolId, context.schoolId),
          eq(teachers.unitId, context.unitId!),
        ),
      )
      .returning()

    if (!updated) {
      notFound('Teacher')
    }

    return updated
  })

export const deactivateTeacher = tenantAdmin
  .use(
    withActivityLog({
      action: 'teacher.deactivated',
      entityType: 'teacher',
      description: 'Menonaktifkan data guru',
    }),
  )
  .input(idParam)
  .handler(async ({ input, context }) => {
    const [updated] = await context.tx
      .update(teachers)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teachers.id, input.id),
          eq(teachers.schoolId, context.schoolId),
          eq(teachers.unitId, context.unitId!),
        ),
      )
      .returning()

    if (!updated) {
      notFound('Teacher')
    }

    return updated
  })
