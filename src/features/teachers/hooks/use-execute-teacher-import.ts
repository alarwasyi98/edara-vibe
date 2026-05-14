import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'
import { invalidateTeacherListQueries } from './teacher-query-cache'

export function useExecuteTeacherImport() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.tenant.teachers.executeImport.mutationOptions({
      onSuccess: async (result) => {
        toast.success(`Import guru selesai. ${result.importedCount} data berhasil ditambahkan.`)
        await invalidateTeacherListQueries(queryClient)
      },
      onError: (error) => {
        toast.error('Gagal mengimpor data guru', {
          description: error.message,
        })
      },
    }),
  )
}
