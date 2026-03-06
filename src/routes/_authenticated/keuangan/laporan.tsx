import { createFileRoute } from '@tanstack/react-router'
import { KeuanganLaporan } from '@/features/keuangan/laporan'

export const Route = createFileRoute('/_authenticated/keuangan/laporan')({
    component: KeuanganLaporan,
})
