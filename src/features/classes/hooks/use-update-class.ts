import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import { invalidateClassQueries } from './class-query-cache'

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.classes.update.mutationOptions({
      onSuccess: () => {
        toast.success('Kelas berhasil diperbarui')
        void invalidateClassQueries(queryClient)
      },
      onError: (error) => {
        toast.error('Gagal memperbarui kelas', {
          description: error.message,
        })
      },
    }),
  )
}
