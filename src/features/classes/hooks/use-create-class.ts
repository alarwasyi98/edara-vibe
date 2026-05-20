import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import { invalidateClassQueries } from './class-query-cache'

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.classes.create.mutationOptions({
      onSuccess: () => {
        toast.success('Kelas berhasil ditambahkan')
        void invalidateClassQueries(queryClient)
      },
      onError: (error) => {
        toast.error('Gagal menambahkan kelas', {
          description: error.message,
        })
      },
    }),
  )
}
