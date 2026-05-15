import * as z from 'zod'

const classNameSchema = z
  .string()
  .trim()
  .min(1, 'Nama kelas wajib diisi')
  .max(50, 'Nama kelas maksimal 50 karakter')

const gradeLevelSchema = z
  .number()
  .int('Tingkat kelas harus berupa angka bulat')
  .min(1, 'Tingkat kelas minimal 1')
  .max(12, 'Tingkat kelas maksimal 12')

const capacitySchema = z
  .number()
  .int('Kapasitas harus berupa angka bulat')
  .min(1, 'Kapasitas minimal 1 siswa')

const optionalHomeroomTeacherSchema = z.string().uuid().nullish()

export const listClassesSchema = z.object({
  academicYearId: z.string().uuid().optional(),
})

export const createClassSchema = z.object({
  academicYearId: z.string().uuid(),
  name: classNameSchema,
  gradeLevel: gradeLevelSchema,
  homeroomTeacherId: optionalHomeroomTeacherSchema,
  capacity: capacitySchema.default(32),
})

export const updateClassSchema = createClassSchema

const massPromotionItemSchema = z.object({
  studentId: z.string().uuid(),
  targetClassId: z.string().uuid(),
})

export const massPromotionSchema = z
  .object({
    sourceClassId: z.string().uuid(),
    targetAcademicYearId: z.string().uuid(),
    promotions: z.array(massPromotionItemSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const seenStudentIds = new Set<string>()

    value.promotions.forEach((promotion, index) => {
      if (seenStudentIds.has(promotion.studentId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['promotions', index, 'studentId'],
          message: 'Setiap siswa hanya boleh dipromosikan satu kali',
        })
      }

      seenStudentIds.add(promotion.studentId)
    })
  })

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
export type MassPromotionInput = z.infer<typeof massPromotionSchema>
