import { createFileRoute } from '@tanstack/react-router'
import { TahunAjaran } from '@/features/tahun-ajaran'

export const Route = createFileRoute('/_authenticated/tahun-ajaran/')({
    component: TahunAjaran,
})
