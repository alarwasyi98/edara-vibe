import { ORPCError } from '@orpc/server'
import ExcelJS from 'exceljs'
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
import type { db } from '@/server/db'
import { teachers } from '@/server/db/schema/teachers'
import { idParam, notFound, paginate, paginationToOffset } from '@/server/shared'
import {
  buildTeacherBulkFileName,
  splitTeacherSubjectCell,
} from '@/lib/teachers-bulk'
import {
  createTeacherSchema,
  executeTeacherImportSchema,
  exportTeachersSchema,
  listTeachersSchema,
  previewTeacherImportSchema,
  updateTeacherSchema,
  type CreateTeacherInput,
  type TeacherImportRowInput,
} from '@/lib/validators/teachers'

const tenantAdmin = authorized.use(
  requireRole(['super_admin', 'kepala_sekolah']),
)

const teacherListSelect = {
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
} as const

type TeacherImportAnalysisRow = {
  rowNumber: number
  nik: string
  namaLengkap: string
  jenisKelamin: string
  statusKepegawaian: string
  mataPelajaran: string[]
  errors: string[]
  warnings: string[]
  isValid: boolean
  payload: CreateTeacherInput | null
}

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

function normalizeOptionalString(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeTeacherImportPayload(row: TeacherImportRowInput): CreateTeacherInput {
  const genderValue = row.jenisKelamin.trim().toUpperCase()
  const employmentStatus = row.statusKepegawaian.trim().toLowerCase()

  return {
    nip: normalizeOptionalString(row.nip),
    nik: row.nik.trim(),
    namaLengkap: row.namaLengkap.trim(),
    jenisKelamin: genderValue as CreateTeacherInput['jenisKelamin'],
    tempatLahir: normalizeOptionalString(row.tempatLahir),
    tanggalLahir: normalizeOptionalString(row.tanggalLahir),
    nomorHp: normalizeOptionalString(row.nomorHp),
    alamat: normalizeOptionalString(row.alamat),
    statusKepegawaian:
      employmentStatus as CreateTeacherInput['statusKepegawaian'],
    mataPelajaran: splitTeacherSubjectCell(row.mataPelajaran),
    tanggalBergabung: row.tanggalBergabung.trim(),
    photoUrl: normalizeOptionalString(row.photoUrl),
  }
}

async function analyzeTeacherImportRows(
  tx: typeof db,
  schoolId: string,
  unitId: string,
  rows: TeacherImportRowInput[],
): Promise<{
  rows: TeacherImportAnalysisRow[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    duplicateRows: number
    conflictRows: number
  }
}> {
  const nikCounts = new Map<string, number>()

  for (const row of rows) {
    const nik = row.nik.trim()

    if (nik.length > 0) {
      nikCounts.set(nik, (nikCounts.get(nik) ?? 0) + 1)
    }
  }

  const uniqueNiks = Array.from(nikCounts.keys())
  const existingTeachers = uniqueNiks.length > 0
    ? await tx
        .select({
          nik: teachers.nik,
          namaLengkap: teachers.namaLengkap,
          isActive: teachers.isActive,
        })
        .from(teachers)
        .where(
          and(
            eq(teachers.schoolId, schoolId),
            eq(teachers.unitId, unitId),
            inArray(teachers.nik, uniqueNiks),
          ),
        )
    : []

  const existingTeacherByNik = new Map(
    existingTeachers.map((teacher) => [teacher.nik, teacher]),
  )

  const analysisRows = rows.map((row) => {
    const payload = normalizeTeacherImportPayload(row)
    const payloadResult = createTeacherSchema.safeParse(payload)
    const errors = payloadResult.success
      ? []
      : payloadResult.error.issues.map((issue) => issue.message)
    const warnings: string[] = []
    const duplicateCount = nikCounts.get(payload.nik) ?? 0
    const existingConflict = existingTeacherByNik.get(payload.nik)

    if (duplicateCount > 1) {
      errors.push('NIK duplikat ditemukan di file import yang sama')
    }

    if (existingConflict) {
      errors.push(
        `NIK sudah terdaftar untuk ${existingConflict.namaLengkap}${existingConflict.isActive ? '' : ' (nonaktif)'}`,
      )
    }

    if (payload.mataPelajaran.length === 0) {
      warnings.push('Mata pelajaran kosong. Guru akan diimpor tanpa mata pelajaran awal.')
    }

    return {
      rowNumber: row.rowNumber,
      nik: payload.nik,
      namaLengkap: payload.namaLengkap,
      jenisKelamin: payload.jenisKelamin,
      statusKepegawaian: payload.statusKepegawaian,
      mataPelajaran: payload.mataPelajaran,
      errors,
      warnings,
      isValid: errors.length === 0,
      payload: payloadResult.success && errors.length === 0 ? payloadResult.data : null,
    }
  })

  return {
    rows: analysisRows,
    summary: {
      totalRows: analysisRows.length,
      validRows: analysisRows.filter((row) => row.isValid).length,
      invalidRows: analysisRows.filter((row) => !row.isValid).length,
      duplicateRows: analysisRows.filter((row) =>
        row.errors.some((error) => error.includes('duplikat')),
      ).length,
      conflictRows: analysisRows.filter((row) =>
        row.errors.some((error) => error.includes('sudah terdaftar')),
      ).length,
    },
  }
}

function toImportPreviewResponse(rows: TeacherImportAnalysisRow[]) {
  return rows.map(({ payload: _payload, ...row }) => row)
}

function toBase64Workbook(buffer: Buffer | Uint8Array | ArrayBuffer): string {
  if (buffer instanceof ArrayBuffer) {
    return Buffer.from(buffer).toString('base64')
  }

  return Buffer.from(buffer).toString('base64')
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
      .select(teacherListSelect)
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

export const previewTeacherImport = tenantAdmin
  .input(previewTeacherImportSchema)
  .handler(async ({ input, context }) => {
    const analysis = await analyzeTeacherImportRows(
      context.tx,
      context.schoolId,
      context.unitId!,
      input.rows,
    )

    return {
      rows: toImportPreviewResponse(analysis.rows),
      summary: analysis.summary,
    }
  })

export const executeTeacherImport = tenantAdmin
  .use(
    withActivityLog({
      action: 'teacher.imported',
      entityType: 'teacher',
      description: 'Mengimpor data guru secara massal',
    }),
  )
  .input(executeTeacherImportSchema)
  .handler(async ({ input, context }) => {
    const analysis = await analyzeTeacherImportRows(
      context.tx,
      context.schoolId,
      context.unitId!,
      input.rows,
    )
    const selectedRowNumbers = new Set(input.selectedRowNumbers)
    const selectedRows = analysis.rows.filter((row) =>
      selectedRowNumbers.has(row.rowNumber),
    )
    const validSelectedRows = selectedRows.filter((row) => row.isValid && row.payload)

    if (selectedRows.length === 0) {
      throw new ORPCError('BAD_REQUEST', 'Pilih minimal satu baris valid untuk diimpor')
    }

    if (validSelectedRows.length === 0) {
      throw new ORPCError('BAD_REQUEST', 'Tidak ada baris valid yang bisa diimpor')
    }

    await context.tx.insert(teachers).values(
      validSelectedRows.map((row) => ({
        ...row.payload!,
        schoolId: context.schoolId,
        unitId: context.unitId!,
      })),
    )

    return {
      importedCount: validSelectedRows.length,
      skippedCount: analysis.rows.length - validSelectedRows.length,
      rows: analysis.rows.map((row) => ({
        rowNumber: row.rowNumber,
        status: selectedRowNumbers.has(row.rowNumber) && row.isValid
          ? 'imported'
          : row.isValid
            ? 'not_selected'
            : 'skipped',
        messages:
          row.errors.length > 0
            ? row.errors
            : row.warnings.length > 0
              ? row.warnings
              : ['Baris valid dan berhasil diproses'],
      })),
    }
  })

export const exportTeachers = tenantAdmin
  .input(exportTeachersSchema)
  .handler(async ({ input, context }) => {
    const rows = await context.tx
      .select(teacherListSelect)
      .from(teachers)
      .where(buildTeacherWhereClause(context.schoolId, context.unitId!, input))
      .orderBy(desc(teachers.isActive), asc(teachers.namaLengkap))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data Guru')

    worksheet.columns = [
      { header: 'NIP', key: 'nip', width: 22 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Nama Lengkap', key: 'namaLengkap', width: 28 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 16 },
      { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
      { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 18 },
      { header: 'Nomor HP', key: 'nomorHp', width: 18 },
      { header: 'Alamat', key: 'alamat', width: 28 },
      { header: 'Status Kepegawaian', key: 'statusKepegawaian', width: 20 },
      { header: 'Mata Pelajaran', key: 'mataPelajaran', width: 32 },
      { header: 'Tanggal Bergabung', key: 'tanggalBergabung', width: 20 },
      { header: 'URL Foto', key: 'photoUrl', width: 28 },
      { header: 'Status Aktif', key: 'statusAktif', width: 14 },
    ]

    worksheet.addRows(
      rows.map((row) => ({
        nip: row.nip ?? '',
        nik: row.nik,
        namaLengkap: row.namaLengkap,
        jenisKelamin: row.jenisKelamin,
        tempatLahir: row.tempatLahir ?? '',
        tanggalLahir: row.tanggalLahir ?? '',
        nomorHp: row.nomorHp ?? '',
        alamat: row.alamat ?? '',
        statusKepegawaian: row.statusKepegawaian,
        mataPelajaran: row.mataPelajaran?.join(', ') ?? '',
        tanggalBergabung: row.tanggalBergabung,
        photoUrl: row.photoUrl ?? '',
        statusAktif: row.isActive ? 'Aktif' : 'Nonaktif',
      })),
    )

    worksheet.getRow(1).font = { bold: true }
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]

    const workbookBuffer = await workbook.xlsx.writeBuffer()

    return {
      fileName: buildTeacherBulkFileName('data-guru'),
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      base64: toBase64Workbook(workbookBuffer),
      rowCount: rows.length,
    }
  })
