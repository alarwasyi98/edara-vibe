import { type StudentStatus } from './schema'

export const statusOptions: {
    label: string
    value: StudentStatus
    color: string
}[] = [
        {
            label: 'Aktif',
            value: 'active',
            color:
                'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
        },
        {
            label: 'Lulus',
            value: 'graduated',
            color: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
        },
        {
            label: 'Pindah',
            value: 'transferred',
            color:
                'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
        },
        {
            label: 'Nonaktif',
            value: 'inactive',
            color: 'bg-neutral-300/40 border-neutral-300',
        },
    ]

export const kelasOptions = [
    'VII-A',
    'VII-B',
    'VII-C',
    'VIII-A',
    'VIII-B',
    'VIII-C',
    'IX-A',
    'IX-B',
    'IX-C',
] as const

export const statusColorMap = new Map<StudentStatus, string>(
    statusOptions.map((opt) => [opt.value, opt.color])
)
