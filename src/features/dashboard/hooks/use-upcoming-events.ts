import { orpc } from '@/lib/orpc-react'

export function useUpcomingEvents() {
  return orpc.tenant.dashboard.getUpcomingEvents.useQuery({})
}
