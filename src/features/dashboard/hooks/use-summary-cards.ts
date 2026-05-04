import { orpc } from '@/lib/orpc-react'

export function useSummaryCards() {
  return orpc.tenant.dashboard.getSummaryCards.useQuery({})
}
