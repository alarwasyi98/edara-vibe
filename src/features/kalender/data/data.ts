import { type EventCategory } from './schema'
import { BookOpen, GraduationCap, Trophy, Users } from 'lucide-react'

export const categoryOptions: {
    label: string
    value: EventCategory
    color: string
    icon: any
}[] = [
        {
            label: 'Akademik',
            value: 'akademik',
            color: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
            icon: BookOpen,
        },
        {
            label: 'Keagamaan',
            value: 'keagamaan',
            color: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
            icon: GraduationCap,
        },
        {
            label: 'Olahraga',
            value: 'olahraga',
            color: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
            icon: Trophy,
        },
        {
            label: 'Umum',
            value: 'umum',
            color: 'bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-200',
            icon: Users,
        },
    ]

export const categoryColorMap = new Map<EventCategory, string>(
    categoryOptions.map((opt) => [opt.value, opt.color])
)

export const categoryIconMap = new Map<EventCategory, any>(
    categoryOptions.map((opt) => [opt.value, opt.icon])
)
