import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'

export function useExportTeachers() {
  return useMutation(
    orpc.tenant.teachers.export.mutationOptions({
      onError: (error) => {
        toast.error('Gagal mengekspor data guru', {
          description: error.message,
        })
      },
    }),
  )
}
