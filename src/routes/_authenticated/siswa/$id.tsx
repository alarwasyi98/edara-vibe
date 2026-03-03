import { createFileRoute } from '@tanstack/react-router'
import { DetailSiswa } from '@/features/siswa/detail'

export const Route = createFileRoute('/_authenticated/siswa/$id')({
    component: DetailSiswa,
})
