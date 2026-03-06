import { createFileRoute } from '@tanstack/react-router'
import { KeuanganAkun } from '@/features/keuangan/akun'

export const Route = createFileRoute('/_authenticated/keuangan/akun')({
  component: KeuanganAkun,
})
