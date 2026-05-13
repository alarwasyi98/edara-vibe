import { type ColumnDef } from '@tanstack/react-table'
import { formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
    genderLabels,
    teacherStatusColors,
    teacherStatusLabels,
} from '@/lib/constants'
import {
    deriveTeacherStatus,
    type TeacherEmploymentStatus,
    type TeacherRecord,
} from '../data/schema'
import { TeacherRowActions } from './teacher-row-actions'

const teacherEmploymentStatusLabels = {
    tetap: 'Tetap',
    honorer: 'Honorer',
    gtt: 'GTT',
} satisfies Record<TeacherEmploymentStatus, string>

export const teacherColumns: ColumnDef<TeacherRecord>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Pilih semua'
                className='translate-y-[2px]'
            />
        ),
        meta: {
            className: cn('bg-background max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
        },
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Pilih baris'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'namaLengkap',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nama Lengkap' />
        ),
        cell: ({ row }) => {
            const teacher = row.original

            return (
                <div className='flex flex-col gap-1'>
                    <LongText className='max-w-44'>{teacher.namaLengkap}</LongText>
                    <span className='text-xs text-muted-foreground'>
                        {teacher.nip ? `NIP ${teacher.nip}` : `NIK ${teacher.nik}`}
                    </span>
                </div>
            )
        },
        meta: {
            className: cn(
                'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
                'bg-background ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
            ),
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'jenisKelamin',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='L/P' />
        ),
        cell: ({ row }) => <span className='text-sm'>{genderLabels[row.original.jenisKelamin]}</span>,
        enableSorting: false,
    },
    {
        accessorKey: 'mataPelajaran',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Mata Pelajaran' />
        ),
        cell: ({ row }) => {
            const subjects = row.original.mataPelajaran

            if (subjects.length === 0) {
                return <span className='text-muted-foreground'>-</span>
            }

            return (
                <div className='flex max-w-64 flex-wrap gap-1'>
                    {subjects.map((subject) => (
                        <Badge key={subject} variant='outline' className='text-nowrap'>
                            {subject}
                        </Badge>
                    ))}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'statusKepegawaian',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Status Kepegawaian' />
        ),
        cell: ({ row }) => {
            const statusKepegawaian = row.original.statusKepegawaian

            return (
                <Badge variant='outline' className='capitalize'>
                    {teacherEmploymentStatusLabels[statusKepegawaian]}
                </Badge>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'nomorHp',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nomor HP' />
        ),
        cell: ({ row }) => {
            const nomorHp = row.original.nomorHp

            if (!nomorHp) {
                return <span className='text-muted-foreground'>-</span>
            }

            return <div className='font-mono text-sm'>{formatPhone(nomorHp)}</div>
        },
        enableSorting: false,
    },
    {
        id: 'status',
        accessorFn: (row) => deriveTeacherStatus(row),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
            const status = deriveTeacherStatus(row.original)

            return (
                <Badge
                    variant='outline'
                    className={cn(
                        'capitalize',
                        teacherStatusColors[status]
                    )}
                >
                    {teacherStatusLabels[status]}
                </Badge>
            )
        },
        enableHiding: false,
        enableSorting: false,
    },
    {
        id: 'actions',
        cell: ({ row }) => <TeacherRowActions row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
]
