import type { QueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc-react'

export function invalidateTeacherListQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: orpc.tenant.teachers.key({ type: 'query' }),
  })
}

export function invalidateTeacherDetailQuery(
  queryClient: QueryClient,
  teacherId: string,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: orpc.tenant.teachers.getById.key({ input: { id: teacherId } }),
  })
}
