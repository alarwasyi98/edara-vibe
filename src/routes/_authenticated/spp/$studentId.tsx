import { createFileRoute } from '@tanstack/react-router'
import { SPPSiswa } from '@/features/spp/student-detail'

export const Route = createFileRoute('/_authenticated/spp/$studentId')({
    component: SPPSiswa,
})
