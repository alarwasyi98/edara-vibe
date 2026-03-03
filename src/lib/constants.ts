import { School, Building2, GraduationCap } from 'lucide-react'

// ──────────────────────────────────────────────
// Tenant / Kampus
// ──────────────────────────────────────────────

export type TenantLevel = 'mi' | 'mts' | 'ma'

export interface Tenant {
  id: string
  name: string
  shortName: string
  level: TenantLevel
  icon: React.ElementType
}

export const tenants: Tenant[] = [
  {
    id: 'campus_mts',
    name: 'MTs Ulul Ilmi',
    shortName: 'MTs',
    level: 'mts',
    icon: School,
  },
  {
    id: 'campus_ma',
    name: 'MA Ulul Ilmi',
    shortName: 'MA',
    level: 'ma',
    icon: Building2,
  },
  {
    id: 'campus_mi',
    name: 'MI Ulul Ilmi',
    shortName: 'MI',
    level: 'mi',
    icon: GraduationCap,
  },
]

// ──────────────────────────────────────────────
// Roles
// ──────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'admin',
  KEPALA_SEKOLAH: 'kepala_sekolah',
  TATA_USAHA: 'tata_usaha',
  BENDAHARA: 'bendahara',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  kepala_sekolah: 'Kepala Sekolah',
  tata_usaha: 'Tata Usaha',
  bendahara: 'Bendahara',
}

// ──────────────────────────────────────────────
// Status Siswa
// ──────────────────────────────────────────────

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  INACTIVE: 'inactive',
} as const

export type StudentStatus =
  (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS]

export const studentStatusLabels: Record<StudentStatus, string> = {
  active: 'Aktif',
  graduated: 'Lulus',
  transferred: 'Pindah',
  inactive: 'Nonaktif',
}

export const studentStatusColors: Record<StudentStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  transferred:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

// ──────────────────────────────────────────────
// Status Guru
// ──────────────────────────────────────────────

export const TEACHER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type TeacherStatus =
  (typeof TEACHER_STATUS)[keyof typeof TEACHER_STATUS]

export const teacherStatusLabels: Record<TeacherStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
}

// ──────────────────────────────────────────────
// Status SPP
// ──────────────────────────────────────────────

export const SPP_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const

export type SppStatus = (typeof SPP_STATUS)[keyof typeof SPP_STATUS]

export const sppStatusLabels: Record<SppStatus, string> = {
  unpaid: 'Belum Dibayar',
  partial: 'Sebagian',
  paid: 'Lunas',
  overdue: 'Menunggak',
}

export const sppStatusColors: Record<SppStatus, string> = {
  unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  partial:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// ──────────────────────────────────────────────
// Status PPDB
// ──────────────────────────────────────────────

export const PPDB_STATUS = {
  BARU: 'baru',
  DIVERIFIKASI: 'diverifikasi',
  DITERIMA: 'diterima',
  DAFTAR_ULANG: 'daftar_ulang',
  TIDAK_LANJUT: 'tidak_lanjut',
} as const

export type PpdbStatus = (typeof PPDB_STATUS)[keyof typeof PPDB_STATUS]

export const ppdbStatusLabels: Record<PpdbStatus, string> = {
  baru: 'Baru Masuk',
  diverifikasi: 'Diverifikasi',
  diterima: 'Diterima',
  daftar_ulang: 'Daftar Ulang',
  tidak_lanjut: 'Tidak Lanjut',
}

export const ppdbStatusColors: Record<PpdbStatus, string> = {
  baru: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  diverifikasi:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  diterima:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  daftar_ulang:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  tidak_lanjut:
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

// ──────────────────────────────────────────────
// Status User
// ──────────────────────────────────────────────

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const userStatusLabels: Record<UserStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  invited: 'Diundang',
  suspended: 'Ditangguhkan',
}

// ──────────────────────────────────────────────
// Jenis Transaksi Keuangan
// ──────────────────────────────────────────────

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
}

// ──────────────────────────────────────────────
// Metode Pembayaran
// ──────────────────────────────────────────────

export const PAYMENT_METHODS = [
  'Tunai',
  'Transfer Bank',
  'QRIS',
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

// ──────────────────────────────────────────────
// Gender
// ──────────────────────────────────────────────

export const GENDER = {
  L: 'L',
  P: 'P',
} as const

export type Gender = (typeof GENDER)[keyof typeof GENDER]

export const genderLabels: Record<Gender, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
}
