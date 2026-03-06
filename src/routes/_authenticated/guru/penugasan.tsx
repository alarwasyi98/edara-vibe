import { createFileRoute } from '@tanstack/react-router'
import { GuruPenugasan } from '@/features/guru/penugasan'

export const Route = createFileRoute('/_authenticated/guru/penugasan')({
  component: GuruPenugasan,
})
