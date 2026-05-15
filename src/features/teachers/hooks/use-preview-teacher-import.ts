import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/orpc-react'

export function usePreviewTeacherImport() {
  return useMutation(
    orpc.tenant.teachers.previewImport.mutationOptions({
      onError: (error) => {
        toast.error('Gagal memvalidasi file import guru', {
          description: error.message,
        })
      },
    }),
  )
}
