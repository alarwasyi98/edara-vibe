import type { QueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc-react'

export function invalidateClassQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: orpc.tenant.classes.key({ type: 'query' }),
  })
}
