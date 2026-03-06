import { createFileRoute } from '@tanstack/react-router'
import { ArusKas } from '@/features/keuangan/arus-kas'

export const Route = createFileRoute('/_authenticated/keuangan/arus-kas')({
  component: ArusKas,
})
