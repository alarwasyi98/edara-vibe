import { useTenantStore } from '@/stores/tenant-store'
import { tenants } from '@/lib/constants'

/**
 * Hook untuk mengakses tenant aktif dan fungsi switching.
 */
export function useTenant() {
    const activeTenantId = useTenantStore((s) => s.activeTenantId)
    const setActiveTenantId = useTenantStore((s) => s.setActiveTenantId)

    const activeTenant =
        tenants.find((t) => t.id === activeTenantId) ?? tenants[0]

    return {
        activeTenant,
        activeTenantId: activeTenant.id,
        setActiveTenantId,
        tenants,
    }
}
