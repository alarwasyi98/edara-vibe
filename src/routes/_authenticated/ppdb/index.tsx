import { createFileRoute } from '@tanstack/react-router'
import { DataPPDB } from '@/features/ppdb'

export const Route = createFileRoute('/_authenticated/ppdb/')({
    component: DataPPDB,
})
