import * as z from 'zod'

export const teacherGenderSchema = z.enum(['L', 'P'])

export const teacherEmploymentStatusSchema = z.enum(['tetap', 'honorer', 'gtt'])

export const teacherSubjectSchema = z
  .string()
  .trim()
  .min(1, 'Mata pelajaran wajib diisi')
  .max(100, 'Mata pelajaran maksimal 100 karakter')

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).nullish()

export const listTeachersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  statusKepegawaian: z.array(teacherEmploymentStatusSchema).default([]),
  mataPelajaran: z.array(teacherSubjectSchema).default([]),
  includeInactive: z.boolean().default(false),
})

export const createTeacherSchema = z.object({
  nip: optionalTrimmedString(50),
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  namaLengkap: z
    .string()
    .trim()
    .min(1, 'Nama lengkap wajib diisi')
    .max(255, 'Nama lengkap maksimal 255 karakter'),
  tempatLahir: optionalTrimmedString(100),
  tanggalLahir: z.string().date('Tanggal lahir tidak valid').nullish(),
  jenisKelamin: teacherGenderSchema,
  nomorHp: optionalTrimmedString(20),
  alamat: z.string().trim().max(1000).nullish(),
  statusKepegawaian: teacherEmploymentStatusSchema,
  mataPelajaran: z.array(teacherSubjectSchema).default([]),
  tanggalBergabung: z.string().date('Tanggal bergabung tidak valid'),
  photoUrl: z.string().trim().url('URL foto tidak valid').nullish(),
})

export const updateTeacherSchema = z
  .object({
    nip: optionalTrimmedString(50),
    nik: z
      .string()
      .trim()
      .regex(/^\d{16}$/, 'NIK harus 16 digit angka')
      .optional(),
    namaLengkap: z
      .string()
      .trim()
      .min(1, 'Nama lengkap wajib diisi')
      .max(255, 'Nama lengkap maksimal 255 karakter')
      .optional(),
    tempatLahir: optionalTrimmedString(100),
    tanggalLahir: z.string().date('Tanggal lahir tidak valid').nullish(),
    jenisKelamin: teacherGenderSchema.optional(),
    nomorHp: optionalTrimmedString(20),
    alamat: z.string().trim().max(1000).nullish(),
    statusKepegawaian: teacherEmploymentStatusSchema.optional(),
    mataPelajaran: z.array(teacherSubjectSchema).optional(),
    tanggalBergabung: z.string().date('Tanggal bergabung tidak valid').optional(),
    photoUrl: z.string().trim().url('URL foto tidak valid').nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diubah',
  })

export type TeacherListInput = z.infer<typeof listTeachersSchema>
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>
