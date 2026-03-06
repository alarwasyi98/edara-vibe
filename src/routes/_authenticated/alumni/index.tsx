import { createFileRoute } from '@tanstack/react-router'
import { Alumni } from '@/features/alumni'

export const Route = createFileRoute('/_authenticated/alumni/')({
    component: Alumni,
})
