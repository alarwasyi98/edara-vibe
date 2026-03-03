import { createFileRoute } from '@tanstack/react-router'
import { PencatatanKeuangan } from '@/features/keuangan'

export const Route = createFileRoute('/_authenticated/keuangan/')({
    component: PencatatanKeuangan,
})
