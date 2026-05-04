import { orpc } from '@/lib/orpc-react'

export function useRecentActivity() {
  return orpc.tenant.dashboard.getRecentActivity.useQuery({})
}
