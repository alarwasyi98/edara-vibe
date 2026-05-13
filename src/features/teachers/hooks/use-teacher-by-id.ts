import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc-react'

export function useTeacherById(id: string) {
  return useQuery(orpc.tenant.teachers.getById.queryOptions({ input: { id } }))
}
