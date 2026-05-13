import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import {
  invalidateTeacherDetailQuery,
  invalidateTeacherListQueries,
} from './teacher-query-cache'

export function useUpdateTeacher() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.teachers.update.mutationOptions({
      onSuccess: (teacher) => {
        toast.success('Data guru berhasil diperbarui')
        void invalidateTeacherListQueries(queryClient)
        void invalidateTeacherDetailQuery(queryClient, teacher.id)
      },
      onError: (error) => {
        toast.error('Gagal memperbarui data guru', {
          description: error.message,
        })
      },
    }),
  )
}
