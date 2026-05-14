import { format } from 'date-fns'

export const teacherBulkTemplateColumns = [
  {
    key: 'nip',
    header: 'NIP',
    required: false,
    example: '198503102010011001',
  },
  {
    key: 'nik',
    header: 'NIK',
    required: true,
    example: '3276010101800001',
  },
  {
    key: 'namaLengkap',
    header: 'Nama Lengkap',
    required: true,
    example: 'Ustadz Ahmad Fauzi',
  },
  {
    key: 'jenisKelamin',
    header: 'Jenis Kelamin (L/P)',
    required: true,
    example: 'L',
  },
  {
    key: 'tempatLahir',
    header: 'Tempat Lahir',
    required: false,
    example: 'Bandung',
  },
  {
    key: 'tanggalLahir',
    header: 'Tanggal Lahir (YYYY-MM-DD)',
    required: false,
    example: '1985-03-10',
  },
  {
    key: 'nomorHp',
    header: 'Nomor HP',
    required: false,
    example: '081234567890',
  },
  {
    key: 'alamat',
    header: 'Alamat',
    required: false,
    example: 'Jl. Pendidikan No. 10',
  },
  {
    key: 'statusKepegawaian',
    header: 'Status Kepegawaian (tetap/honorer/gtt)',
    required: true,
    example: 'tetap',
  },
  {
    key: 'mataPelajaran',
    header: 'Mata Pelajaran (pisahkan dengan koma)',
    required: false,
    example: 'Matematika, IPA',
  },
  {
    key: 'tanggalBergabung',
    header: 'Tanggal Bergabung (YYYY-MM-DD)',
    required: true,
    example: '2024-07-01',
  },
  {
    key: 'photoUrl',
    header: 'URL Foto',
    required: false,
    example: 'https://example.com/foto-guru.jpg',
  },
] as const

export type TeacherBulkFieldKey =
  (typeof teacherBulkTemplateColumns)[number]['key']

export type TeacherBulkRowInput = {
  rowNumber: number
} & Record<TeacherBulkFieldKey, string>

const teacherBulkHeaderAliases: Record<string, TeacherBulkFieldKey> = {
  nip: 'nip',
  nik: 'nik',
  namalengkap: 'namaLengkap',
  nama: 'namaLengkap',
  jeniskelaminlp: 'jenisKelamin',
  jeniskelamin: 'jenisKelamin',
  gender: 'jenisKelamin',
  tempatlahir: 'tempatLahir',
  tanggallahiryyyymmdd: 'tanggalLahir',
  tanggallahir: 'tanggalLahir',
  nomorhp: 'nomorHp',
  nohp: 'nomorHp',
  telepon: 'nomorHp',
  alamat: 'alamat',
  statuskepegawaiantepathonorergtt: 'statusKepegawaian',
  statuskepegawaian: 'statusKepegawaian',
  matapelajaranpisahkandengankoma: 'mataPelajaran',
  matapelajaran: 'mataPelajaran',
  tanggabergabungyyyymmdd: 'tanggalBergabung',
  tanggalbergabungyyyymmdd: 'tanggalBergabung',
  tanggalbergabung: 'tanggalBergabung',
  urlfoto: 'photoUrl',
  photourl: 'photoUrl',
  fotourl: 'photoUrl',
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function normalizeTeacherBulkCell(value: unknown): string {
  if (value == null) {
    return ''
  }

  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd')
  }

  return String(value).trim()
}

export function splitTeacherSubjectCell(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  )
}

export function isTeacherBulkRowEmpty(row: readonly unknown[]): boolean {
  return row.every((cell) => normalizeTeacherBulkCell(cell).length === 0)
}

export function mapTeacherBulkWorksheetRows(
  rows: readonly (readonly unknown[])[],
): TeacherBulkRowInput[] {
  const [headerRow = []] = rows
  const columnIndexByKey = new Map<TeacherBulkFieldKey, number>()

  headerRow.forEach((cell, index) => {
    const headerKey = teacherBulkHeaderAliases[normalizeHeader(normalizeTeacherBulkCell(cell))]

    if (headerKey) {
      columnIndexByKey.set(headerKey, index)
    }
  })

  return rows.slice(1).flatMap((row, rowIndex) => {
    if (isTeacherBulkRowEmpty(row)) {
      return []
    }

      const mapped = {
        rowNumber: rowIndex + 2,
      } as TeacherBulkRowInput

      for (const column of teacherBulkTemplateColumns) {
        mapped[column.key] = normalizeTeacherBulkCell(
          row[columnIndexByKey.get(column.key) ?? -1],
        )
      }

      return [mapped]
    })
}

export function buildTeacherBulkTemplateRows(): string[][] {
  return [
    teacherBulkTemplateColumns.map((column) => column.header),
    teacherBulkTemplateColumns.map((column) => column.example),
  ]
}

export function buildTeacherBulkFileName(prefix: string, now = new Date()): string {
  return `${prefix}-${format(now, 'yyyy-MM-dd-HHmm')}.xlsx`
}
