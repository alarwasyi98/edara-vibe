import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc-react'

export function useClasses(academicYearId?: string, enabled = true) {
  return useQuery({
    ...orpc.tenant.classes.list.queryOptions({
      input: academicYearId ? { academicYearId } : {},
    }),
    enabled,
  })
}
