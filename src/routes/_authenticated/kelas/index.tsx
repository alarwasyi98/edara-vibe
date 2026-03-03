import { createFileRoute } from '@tanstack/react-router'
import { DataKelas } from '@/features/kelas'

export const Route = createFileRoute('/_authenticated/kelas/')({
    component: DataKelas,
})
