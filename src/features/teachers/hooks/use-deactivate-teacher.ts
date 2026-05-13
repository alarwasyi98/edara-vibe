import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import {
  invalidateTeacherDetailQuery,
  invalidateTeacherListQueries,
} from './teacher-query-cache'

export function useDeactivateTeacher() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.teachers.deactivate.mutationOptions({
      onSuccess: (teacher) => {
        toast.success('Data guru berhasil dinonaktifkan')
        void invalidateTeacherListQueries(queryClient)
        void invalidateTeacherDetailQuery(queryClient, teacher.id)
      },
      onError: (error) => {
        toast.error('Gagal menonaktifkan data guru', {
          description: error.message,
        })
      },
    }),
  )
}
