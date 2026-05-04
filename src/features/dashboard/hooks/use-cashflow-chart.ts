import { orpc } from '@/lib/orpc-react'

export function useCashflowChart(months = 6) {
  return orpc.tenant.dashboard.getCashflowChart.useQuery({ months })
}
