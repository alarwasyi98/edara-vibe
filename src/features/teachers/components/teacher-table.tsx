import { useEffect, useMemo, useState } from 'react'
import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
    buildTeacherSubjectOptions,
    teacherEmploymentStatusOptions,
    teacherRouteSearchDefaults,
    type TeacherRecord,
} from '../data/schema'
import { teacherColumns as columns } from './teacher-columns'

type TeacherTableProps = {
    data: TeacherRecord[]
    search: Record<string, unknown>
    navigate: NavigateFn
    totalRows: number
    totalPages: number
    isLoading: boolean
    isFetching: boolean
    isError: boolean
}

export function TeacherTable({
    data,
    search,
    navigate,
    totalRows,
    totalPages,
    isLoading,
    isFetching,
    isError,
}: TeacherTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const includeInactive = search.includeInactive === true
    const resolvedPageCount = totalRows === 0 ? 1 : totalPages
    const subjectOptions = useMemo(
        () => buildTeacherSubjectOptions(data.flatMap((teacher) => teacher.mataPelajaran)),
        [data]
    )

    const {
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    } = useTableUrlState({
        search,
        navigate,
        pagination: {
            defaultPage: teacherRouteSearchDefaults.page,
            defaultPageSize: teacherRouteSearchDefaults.pageSize,
        },
        globalFilter: { enabled: false },
        columnFilters: [
            { columnId: 'namaLengkap', searchKey: 'search', type: 'string' },
            {
                columnId: 'statusKepegawaian',
                searchKey: 'statusKepegawaian',
                type: 'array',
            },
            {
                columnId: 'mataPelajaran',
                searchKey: 'mataPelajaran',
                type: 'array',
            },
        ],
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,
            columnVisibility,
        },
        manualPagination: true,
        manualFiltering: true,
        pageCount: resolvedPageCount,
        rowCount: totalRows,
        enableRowSelection: true,
        onPaginationChange,
        onColumnFiltersChange,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    useEffect(() => {
        ensurePageInRange(table.getPageCount())
    }, [table, ensurePageInRange])

    return (
        <div
            className={cn(
                'max-sm:has-[div[role="toolbar"]]:mb-16',
                'flex flex-1 flex-col gap-4'
            )}
        >
            <DataTableToolbar
                table={table}
                searchPlaceholder='Cari guru, NIP, atau NIK...'
                searchKey='namaLengkap'
                filters={[
                    {
                        columnId: 'statusKepegawaian',
                        title: 'Status Kepegawaian',
                        options: teacherEmploymentStatusOptions.map((status) => ({
                            label: status.label,
                            value: status.value,
                        })),
                    },
                    {
                        columnId: 'mataPelajaran',
                        title: 'Mata Pelajaran',
                        options: subjectOptions.map((subject) => ({
                            label: subject.label,
                            value: subject.value,
                        })),
                    },
                ]}
            />
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-muted-foreground'>
                    {isLoading
                        ? 'Memuat data guru...'
                        : isError
                            ? 'Gagal memuat data guru.'
                            : `Total ${totalRows} guru${isFetching ? ' • Memperbarui data...' : ''}`}
                </p>
                <div className='flex items-center gap-2 self-start sm:self-auto'>
                    <Checkbox
                        id='teacher-include-inactive'
                        checked={includeInactive}
                        onCheckedChange={(checked) => {
                            navigate({
                                search: (prev) => ({
                                    ...(prev as Record<string, unknown>),
                                    page: undefined,
                                    includeInactive:
                                        checked === true ? true : undefined,
                                }),
                            })
                        }}
                    />
                    <Label
                        htmlFor='teacher-include-inactive'
                        className='cursor-pointer text-sm text-muted-foreground'
                    >
                        Tampilkan guru nonaktif
                    </Label>
                </div>
            </div>
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='group/row'>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={cn(
                                            'group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                            header.column.columnDef.meta?.className,
                                            header.column.columnDef.meta?.thClassName
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    Memuat data guru...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    Gagal memuat data guru.
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={cn(
                                        'group/row',
                                        !row.original.isActive &&
                                            'bg-muted/30 text-muted-foreground'
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                cell.column.columnDef.meta?.className,
                                                cell.column.columnDef.meta?.tdClassName
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    Tidak ada data guru.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} className='mt-auto' />
        </div>
    )
}
