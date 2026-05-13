import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import { invalidateTeacherListQueries } from './teacher-query-cache'

export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.teachers.create.mutationOptions({
      onSuccess: () => {
        toast.success('Data guru berhasil ditambahkan')
        void invalidateTeacherListQueries(queryClient)
      },
      onError: (error) => {
        toast.error('Gagal menambahkan data guru', {
          description: error.message,
        })
      },
    }),
  )
}
