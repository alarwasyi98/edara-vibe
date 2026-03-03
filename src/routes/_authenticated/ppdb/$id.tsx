import { createFileRoute } from '@tanstack/react-router'
import { DetailPPDB } from '@/features/ppdb/detail'

export const Route = createFileRoute('/_authenticated/ppdb/$id')({
    component: DetailPPDB,
})
