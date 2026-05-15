import { describe, expect, it } from 'vitest'
import {
  buildTeacherBulkTemplateRows,
  mapTeacherBulkWorksheetRows,
  splitTeacherSubjectCell,
} from '@/lib/teachers-bulk'

describe('teachers bulk helpers', () => {
  it('builds a template with the expected header order', () => {
    const [headers, example] = buildTeacherBulkTemplateRows()

    expect(headers).toEqual([
      'NIP',
      'NIK',
      'Nama Lengkap',
      'Jenis Kelamin (L/P)',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Nomor HP',
      'Alamat',
      'Status Kepegawaian (tetap/honorer/gtt)',
      'Mata Pelajaran (pisahkan dengan koma)',
      'Tanggal Bergabung (YYYY-MM-DD)',
      'URL Foto',
    ])
    expect(example).toHaveLength(headers.length)
  })

  it('maps worksheet rows into normalized teacher import payloads', () => {
    const rows = mapTeacherBulkWorksheetRows([
      ['Nama Lengkap', 'NIK', 'Jenis Kelamin (L/P)', 'Tanggal Bergabung (YYYY-MM-DD)', 'Mata Pelajaran (pisahkan dengan koma)'],
      ['Ustadz Ahmad', '3276010101800001', 'L', '2024-07-01', 'Matematika, IPA'],
      ['', '', '', '', ''],
      ['Ustadzah Siti', '3276010101800002', 'P', '2024-07-10', 'Bahasa Indonesia'],
    ])

    expect(rows).toEqual([
      expect.objectContaining({
        rowNumber: 2,
        namaLengkap: 'Ustadz Ahmad',
        nik: '3276010101800001',
        jenisKelamin: 'L',
        tanggalBergabung: '2024-07-01',
        mataPelajaran: 'Matematika, IPA',
      }),
      expect.objectContaining({
        rowNumber: 4,
        namaLengkap: 'Ustadzah Siti',
        nik: '3276010101800002',
      }),
    ])
  })

  it('splits subjects by comma, semicolon, and line breaks', () => {
    expect(splitTeacherSubjectCell('Matematika, IPA; TIK\nMatematika')).toEqual([
      'Matematika',
      'IPA',
      'TIK',
    ])
  })
})
