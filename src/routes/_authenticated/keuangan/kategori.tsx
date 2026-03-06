import { createFileRoute } from '@tanstack/react-router'
import { KeuanganKategori } from '@/features/keuangan/kategori'

export const Route = createFileRoute('/_authenticated/keuangan/kategori')({
  component: KeuanganKategori,
})
