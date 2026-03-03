import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSPP } from '@/features/spp'

export const Route = createFileRoute('/_authenticated/spp/')({
    component: ManajemenSPP,
})
