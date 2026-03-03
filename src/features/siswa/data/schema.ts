import { z } from 'zod'

const studentStatusSchema = z.union([
    z.literal('active'),
    z.literal('graduated'),
    z.literal('transferred'),
    z.literal('inactive'),
])
export type StudentStatus = z.infer<typeof studentStatusSchema>

const genderSchema = z.union([z.literal('L'), z.literal('P')])

const studentSchema = z.object({
    id: z.string(),
    nis: z.string(),
    nisn: z.string(),
    namaLengkap: z.string(),
    jenisKelamin: genderSchema,
    tempatLahir: z.string(),
    tanggalLahir: z.coerce.date(),
    kelas: z.string(),
    tahunMasuk: z.string(),
    status: studentStatusSchema,
    namaWali: z.string(),
    teleponWali: z.string(),
    alamat: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
})
export type Student = z.infer<typeof studentSchema>

export const studentListSchema = z.array(studentSchema)
