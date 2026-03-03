import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Tenant, tenants } from '@/lib/constants'

interface TenantState {
    activeTenantId: string
    setActiveTenantId: (id: string) => void
    getActiveTenant: () => Tenant
}

export const useTenantStore = create<TenantState>()(
    persist(
        (set, get) => ({
            activeTenantId: tenants[0].id,

            setActiveTenantId: (id: string) => {
                set({ activeTenantId: id })
            },

            getActiveTenant: () => {
                const { activeTenantId } = get()
                return (
                    tenants.find((t) => t.id === activeTenantId) ?? tenants[0]
                )
            },
        }),
        {
            name: 'uims-tenant',
        }
    )
)
