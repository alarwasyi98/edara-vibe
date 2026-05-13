import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc-react'
import type { TeacherRouteSearch } from '../data/schema'

export function useTeachers(search: TeacherRouteSearch) {
  return useQuery(orpc.tenant.teachers.list.queryOptions({ input: search }))
}
