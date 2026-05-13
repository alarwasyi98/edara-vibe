import { createFileRoute } from '@tanstack/react-router'
import { DataTeacher } from '@/features/teachers'
import { teacherRouteSearchSchema } from '@/features/teachers/data/schema'

export const Route = createFileRoute('/_authenticated/teachers/')({
    validateSearch: teacherRouteSearchSchema,
    component: DataTeacher,
})
