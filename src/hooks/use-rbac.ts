import { useCallback } from 'react'
import {
    type Module,
    type Permission,
    hasPermission,
    canAccessModule,
} from '@/config/rbac'
import { type Role } from '@/lib/constants'

/**
 * Mock: role user aktif. Pada integrasi backend, ini diambil dari Clerk/session.
 * Ubah default role di sini untuk testing RBAC.
 */
const MOCK_CURRENT_ROLE: Role = 'admin'

/**
 * Hook untuk mengecek permission RBAC pada modul tertentu.
 */
export function useRbac(role: Role = MOCK_CURRENT_ROLE) {
    const can = useCallback(
        (module: Module, permission: Permission) =>
            hasPermission(role, module, permission),
        [role]
    )

    const canAccess = useCallback(
        (module: Module) => canAccessModule(role, module),
        [role]
    )

    return {
        role,
        can,
        canAccess,
    }
}
