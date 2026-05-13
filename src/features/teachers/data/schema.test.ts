import { describe, expect, it } from 'vitest'
import {
    buildTeacherSubjectOptions,
    deriveTeacherStatus,
    mapTeacherToEditFormDefaults,
    normalizeTeacherMataPelajaran,
    teacherRouteSearchDefaults,
    teacherRouteSearchSchema,
    type TeacherRecord,
} from './schema'

describe('teacher schema helpers', () => {
    it('parses teacher route search defaults', () => {
        expect(teacherRouteSearchSchema.parse({})).toEqual(
            teacherRouteSearchDefaults
        )
        expect(teacherRouteSearchDefaults.pageSize).toBe(10)
    })

    it('normalizes mataPelajaran inputs to arrays', () => {
        expect(
            normalizeTeacherMataPelajaran('Matematika, IPA , TIK, Matematika')
        ).toEqual(['Matematika', 'IPA', 'TIK'])
        expect(normalizeTeacherMataPelajaran(['Fiqih', '  SKI  '])).toEqual([
            'Fiqih',
            'SKI',
        ])
    })

    it('derives active and inactive teacher status from isActive', () => {
        expect(deriveTeacherStatus({ isActive: true })).toBe('active')
        expect(deriveTeacherStatus({ isActive: false })).toBe('inactive')
    })

    it('preserves custom live subjects when building subject options', () => {
        expect(buildTeacherSubjectOptions(['Robotik', 'Matematika'])).toEqual(
            expect.arrayContaining([
                { label: 'Matematika', value: 'Matematika' },
                { label: 'Robotik', value: 'Robotik' },
            ])
        )
    })

    it('maps live teacher records to edit form defaults', () => {
        const teacher: TeacherRecord = {
            id: 'teacher-1',
            schoolId: 'school-1',
            unitId: 'unit-1',
            nip: null,
            nik: '1234567890123456',
            namaLengkap: 'Ustadz Ahmad',
            tempatLahir: null,
            tanggalLahir: new Date('1980-05-12T00:00:00.000Z'),
            jenisKelamin: 'L',
            nomorHp: null,
            alamat: null,
            statusKepegawaian: 'tetap',
            mataPelajaran: ['Matematika', '  IPA  '],
            tanggalBergabung: null,
            photoUrl: null,
            isActive: true,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        }

        expect(mapTeacherToEditFormDefaults(teacher)).toEqual({
            nip: '',
            nik: '1234567890123456',
            namaLengkap: 'Ustadz Ahmad',
            jenisKelamin: 'L',
            tempatLahir: '',
            tanggalLahir: new Date('1980-05-12T00:00:00.000Z'),
            nomorHp: '',
            alamat: '',
            statusKepegawaian: 'tetap',
            mataPelajaran: ['Matematika', 'IPA'],
            tanggalBergabung: undefined,
            photoUrl: '',
            isActive: true,
        })
    })
})
