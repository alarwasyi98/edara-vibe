import { z } from 'zod'

const teacherStatusSchema = z.union([
    z.literal('active'),
    z.literal('inactive'),
])
export type TeacherStatus = z.infer<typeof teacherStatusSchema>

const teacherGenderSchema = z.union([z.literal('L'), z.literal('P')])
export type TeacherGender = z.infer<typeof teacherGenderSchema>

export const teacherEmploymentStatusValues = ['tetap', 'honorer', 'gtt'] as const
export type TeacherEmploymentStatus = (typeof teacherEmploymentStatusValues)[number]

export const teacherEmploymentStatusOptions = [
    { label: 'Tetap', value: 'tetap' },
    { label: 'Honorer', value: 'honorer' },
    { label: 'GTT', value: 'gtt' },
] as const satisfies ReadonlyArray<{
    label: string
    value: TeacherEmploymentStatus
}>

export const teacherSubjectValues = [
    'Al-Quran Hadits',
    'Aqidah Akhlak',
    'Fiqih',
    'SKI',
    'Bahasa Arab',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'PKn',
    'Seni Budaya',
    'PJOK',
    'Prakarya',
    'TIK',
] as const
export type TeacherSubject = (typeof teacherSubjectValues)[number]

export const teacherSubjectOptions = [
    { label: 'Al-Quran Hadits', value: 'Al-Quran Hadits' },
    { label: 'Aqidah Akhlak', value: 'Aqidah Akhlak' },
    { label: 'Fiqih', value: 'Fiqih' },
    { label: 'SKI', value: 'SKI' },
    { label: 'Bahasa Arab', value: 'Bahasa Arab' },
    { label: 'Bahasa Indonesia', value: 'Bahasa Indonesia' },
    { label: 'Bahasa Inggris', value: 'Bahasa Inggris' },
    { label: 'Matematika', value: 'Matematika' },
    { label: 'IPA', value: 'IPA' },
    { label: 'IPS', value: 'IPS' },
    { label: 'PKn', value: 'PKn' },
    { label: 'Seni Budaya', value: 'Seni Budaya' },
    { label: 'PJOK', value: 'PJOK' },
    { label: 'Prakarya', value: 'Prakarya' },
    { label: 'TIK', value: 'TIK' },
] as const satisfies ReadonlyArray<{
    label: string
    value: string
}>

export type TeacherSubjectOption = {
    label: string
    value: string
}

const teacherEmploymentStatusSchema = z.enum(teacherEmploymentStatusValues)

const normalizeStringList = (value: unknown): string[] => {
    const flattened = typeof value === 'string'
        ? value.split(',')
        : Array.isArray(value)
            ? value.flatMap((item) => normalizeStringList(item))
            : []

    return Array.from(
        new Set(
            flattened
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
        )
    )
}

export function normalizeTeacherMataPelajaran(value: unknown): string[] {
    return normalizeStringList(value)
}

export function buildTeacherSubjectOptions(
    additionalSubjects: readonly string[] = []
): TeacherSubjectOption[] {
    const normalizedAdditionalSubjects = normalizeTeacherMataPelajaran(additionalSubjects)
    const knownValues = new Set(teacherSubjectOptions.map((subject) => subject.value))

    return [
        ...teacherSubjectOptions,
        ...normalizedAdditionalSubjects
            .filter((subject) => !knownValues.has(subject))
            .map((subject) => ({
                label: subject,
                value: subject,
            })),
    ]
}

const normalizeTeacherEmploymentStatus = (
    value: unknown
): TeacherEmploymentStatus[] =>
    normalizeStringList(value).filter(
        (item): item is TeacherEmploymentStatus =>
            teacherEmploymentStatusValues.includes(item as TeacherEmploymentStatus)
    )

const booleanFromSearchSchema = z.preprocess((value) => {
    if (typeof value === 'string') {
        if (value === 'true') return true
        if (value === 'false') return false
    }

    return value
}, z.boolean())

export const teacherRouteSearchSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(255).default(''),
    statusKepegawaian: z.preprocess(
        normalizeTeacherEmploymentStatus,
        z.array(teacherEmploymentStatusSchema).default([])
    ),
    mataPelajaran: z.preprocess(
        normalizeTeacherMataPelajaran,
        z.array(z.string()).default([])
    ),
    includeInactive: booleanFromSearchSchema.default(false),
})
export type TeacherRouteSearch = z.infer<typeof teacherRouteSearchSchema>

export const teacherRouteSearchDefaults = {
    page: 1,
    pageSize: 10,
    search: '',
    statusKepegawaian: [],
    mataPelajaran: [],
    includeInactive: false,
} satisfies TeacherRouteSearch

const liveTeacherSchema = z.object({
    id: z.string(),
    schoolId: z.string(),
    unitId: z.string(),
    nip: z.string().nullish(),
    nik: z.string(),
    namaLengkap: z.string(),
    tempatLahir: z.string().nullish(),
    tanggalLahir: z.coerce.date().nullish(),
    jenisKelamin: teacherGenderSchema,
    nomorHp: z.string().nullish(),
    alamat: z.string().nullish(),
    statusKepegawaian: teacherEmploymentStatusSchema,
    mataPelajaran: z.preprocess(
        normalizeTeacherMataPelajaran,
        z.array(z.string()).default([])
    ),
    tanggalBergabung: z.coerce.date().nullish(),
    photoUrl: z.string().nullish(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})

export type TeacherRecord = z.infer<typeof liveTeacherSchema>
export const teacherRecordListSchema = z.array(liveTeacherSchema)

export type TeacherEditFormDefaults = {
    nip: string
    nik: string
    namaLengkap: string
    jenisKelamin: TeacherGender
    tempatLahir: string
    tanggalLahir: Date | undefined
    nomorHp: string
    alamat: string
    statusKepegawaian: TeacherEmploymentStatus
    mataPelajaran: string[]
    tanggalBergabung: Date | undefined
    photoUrl: string
    isActive: boolean
}

export function deriveTeacherStatus(
    teacher: Pick<TeacherRecord, 'isActive'>
): TeacherStatus {
    return teacher.isActive ? 'active' : 'inactive'
}

export function mapTeacherToEditFormDefaults(
    teacher: TeacherRecord
): TeacherEditFormDefaults {
    return {
        nip: teacher.nip ?? '',
        nik: teacher.nik,
        namaLengkap: teacher.namaLengkap,
        jenisKelamin: teacher.jenisKelamin,
        tempatLahir: teacher.tempatLahir ?? '',
        tanggalLahir: teacher.tanggalLahir ?? undefined,
        nomorHp: teacher.nomorHp ?? '',
        alamat: teacher.alamat ?? '',
        statusKepegawaian: teacher.statusKepegawaian,
        mataPelajaran: normalizeTeacherMataPelajaran(teacher.mataPelajaran),
        tanggalBergabung: teacher.tanggalBergabung ?? undefined,
        photoUrl: teacher.photoUrl ?? '',
        isActive: teacher.isActive,
    }
}

const teacherLegacySchema = z.object({
    id: z.string(),
    nip: z.string(),
    namaLengkap: z.string(),
    jenisKelamin: teacherGenderSchema,
    tempatLahir: z.string(),
    tanggalLahir: z.coerce.date(),
    mataPelajaran: z.string(),
    pendidikanTerakhir: z.string(),
    telepon: z.string(),
    email: z.string(),
    status: teacherStatusSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})
export type Teacher = z.infer<typeof teacherLegacySchema>

export const teacherListSchema = z.array(teacherLegacySchema)
