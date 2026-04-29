import { type Role } from '@/lib/constants'

// ──────────────────────────────────────────────
// Permission Types
// ──────────────────────────────────────────────

export type Permission = 'read' | 'create' | 'update' | 'delete'

export type Module =
    | 'dashboard'
    | 'siswa'
    | 'kelas'
    | 'tahun_ajaran'
    | 'ppdb'
    | 'guru'
    | 'kalender'
    | 'spp'
    | 'jenis_bayar'
    | 'keuangan'
    | 'users'
    | 'settings'

// ──────────────────────────────────────────────
// Permission Matrix
// ──────────────────────────────────────────────

const allPermissions: Permission[] = ['read', 'create', 'update', 'delete']
const readOnly: Permission[] = ['read']
const readWrite: Permission[] = ['read', 'create', 'update']
const none: Permission[] = []

export const rolePermissions: Record<Role, Record<Module, Permission[]>> = {
    super_admin: {
        dashboard: allPermissions,
        siswa: allPermissions,
        kelas: allPermissions,
        tahun_ajaran: allPermissions,
        ppdb: allPermissions,
        guru: allPermissions,
        kalender: allPermissions,
        spp: allPermissions,
        jenis_bayar: allPermissions,
        keuangan: allPermissions,
        users: allPermissions,
        settings: allPermissions,
    },

    kepala_sekolah: {
        dashboard: readOnly,
        siswa: readOnly,
        kelas: readOnly,
        tahun_ajaran: readWrite,
        ppdb: readOnly,
        guru: readOnly,
        kalender: readOnly,
        spp: readOnly,
        jenis_bayar: readOnly,
        keuangan: readOnly,
        users: readWrite,
        settings: readOnly,
    },

    admin_tu: {
        dashboard: readOnly,
        siswa: allPermissions,
        kelas: allPermissions,
        tahun_ajaran: allPermissions,
        ppdb: allPermissions,
        guru: allPermissions,
        kalender: allPermissions,
        spp: readOnly,
        jenis_bayar: none,
        keuangan: none,
        users: none,
        settings: readOnly,
    },

    bendahara: {
        dashboard: readOnly,
        siswa: readOnly,
        kelas: none,
        tahun_ajaran: none,
        ppdb: none,
        guru: none,
        kalender: readOnly,
        spp: allPermissions,
        jenis_bayar: allPermissions,
        keuangan: allPermissions,
        users: none,
        settings: readOnly,
    },
}

// ──────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────

/**
 * Cek apakah role memiliki permission tertentu pada modul.
 */
export function hasPermission(
    role: Role,
    module: Module,
    permission: Permission
): boolean {
    return rolePermissions[role]?.[module]?.includes(permission) ?? false
}

/**
 * Cek apakah role dapat mengakses modul (minimal read).
 */
export function canAccessModule(role: Role, module: Module): boolean {
    const perms = rolePermissions[role]?.[module]
    return perms !== undefined && perms.length > 0
}

/**
 * Dapatkan daftar module yang dapat diakses oleh role.
 */
export function getAccessibleModules(role: Role): Module[] {
    const modules = Object.keys(rolePermissions[role] ?? {}) as Module[]
    return modules.filter((m) => canAccessModule(role, m))
}
