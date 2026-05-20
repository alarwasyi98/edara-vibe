import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import { invalidateClassQueries } from './class-query-cache'

export function useMassPromotion() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.classes.massPromotion.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success('Kenaikan kelas massal berhasil diproses', {
          description: `${variables.promotions.length} siswa dipindahkan ke tahun ajaran berikutnya.`,
        })
        void invalidateClassQueries(queryClient)
      },
      onError: (error) => {
        toast.error('Gagal menjalankan kenaikan kelas massal', {
          description: error.message,
        })
      },
    }),
  )
}
