import { createFileRoute } from '@tanstack/react-router'
import { DetailGuru } from '@/features/guru/detail'

export const Route = createFileRoute('/_authenticated/guru/$id')({
    component: DetailGuru,
})
