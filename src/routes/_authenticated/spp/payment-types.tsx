import { createFileRoute } from '@tanstack/react-router'
import { JenisBayar } from '@/features/spp/jenis-bayar'

export const Route = createFileRoute('/_authenticated/spp/payment-types')({
  component: JenisBayar,
})