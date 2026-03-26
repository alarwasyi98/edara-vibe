import { useState, lazy, Suspense } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { faker } from '@faker-js/faker'
import {
    type ColumnDef,
    type SortingState,
    type VisibilityState,
    type ColumnFiltersState,
    type PaginationState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { formatRupiah, formatBulanTagihan } from '@/lib/format'
import { sppStatusLabels, sppStatusColors, type SppStatus } from '@/lib/constants'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'

import {
    Receipt,
    TrendingUp,
    AlertTriangle,
    Clock,
    X,
    Send,
    CheckSquare,
    MoreHorizontal,
    Pencil,
    Trash2,
    Upload,
    Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTableToolbar, DataTablePagination, DataTableColumnHeader } from '@/components/data-table'
import { SppImportDialog, SppExportDialog } from './components/spp-dialogs'

// Lazy loaded charts
const SppCharts = lazy(() => import('@/features/spp/components/spp-charts.tsx'))

faker.seed(99999)

// ─── Types ────────────────────────────────────────────────────────────────────

type SppPayment = {
    id: string
    namaSiswa: string
    kelas: string
    bulan: string
    nominal: number
    dibayar: number
    status: SppStatus
    tanggalBayar: string | null
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const bulanList = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
const siswaNames = [
    'Ahmad Rizki F.', 'Nisa Putri Ayu', 'Muhammad Faqih', 'Siti Aminah',
    'Hasan Ridwan', 'Zahra Khadijah', 'Bayu Pratama', 'Fatimah Azzahra',
    'Irfan Maulana', 'Layla Rahma', 'Galih Nugroho', 'Annisa Dewi',
    'Rafi Hidayat', 'Salma Utami', 'Dani Kurniawan', 'Aji Saputra',
]
const kelasList = ['VII-A', 'VII-B', 'VII-C', 'VIII-A', 'VIII-B', 'VIII-C', 'IX-A', 'IX-B', 'IX-C']

const initialPayments: SppPayment[] = Array.from({ length: 50 }, () => {
    const nominal = 750000
    const status = faker.helpers.weightedArrayElement([
        { weight: 5, value: 'paid' as const },
        { weight: 2, value: 'unpaid' as const },
        { weight: 1.5, value: 'partial' as const },
        { weight: 1.5, value: 'overdue' as const },
    ])

    return {
        id: faker.string.uuid(),
        namaSiswa: faker.helpers.arrayElement(siswaNames),
        kelas: faker.helpers.arrayElement(kelasList),
        bulan: faker.helpers.arrayElement(bulanList),
        nominal,
        dibayar: status === 'paid' ? nominal : status === 'partial' ? Math.floor(nominal * 0.5) : 0,
        status,
        tanggalBayar: status === 'paid' || status === 'partial'
            ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
            : null,
    }
})

// ─── Main Component ───────────────────────────────────────────────────────────

export function ManajemenSPP() {
    const navigate = useNavigate()
    const [dialog, setDialog] = useState<'import' | 'export' | null>(null)
    const [payments] = useState<SppPayment[]>(initialPayments)
    const [rowSelection, setRowSelection] = useState({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

    const columns: ColumnDef<SppPayment>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Pilih semua'
                    className='translate-y-[2px]'
                />
            ),
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
            accessorKey: 'namaSiswa',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Siswa' />,
            cell: ({ row }) => <span className='font-medium'>{row.getValue('namaSiswa')}</span>,
        },
        {
            accessorKey: 'kelas',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Kelas' />,
            cell: ({ row }) => row.getValue('kelas'),
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: 'bulan',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Bulan' />,
            cell: ({ row }) => formatBulanTagihan(row.getValue('bulan')),
        },
        {
            accessorKey: 'nominal',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Tagihan' />,
            cell: ({ row }) => <span className='font-mono text-right block'>{formatRupiah(row.getValue('nominal'))}</span>,
            meta: { className: 'text-right' },
        },
        {
            accessorKey: 'dibayar',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Dibayar' />,
            cell: ({ row }) => <span className='font-mono text-right block'>{formatRupiah(row.getValue('dibayar'))}</span>,
            meta: { className: 'text-right' },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => {
                const status = row.getValue('status') as SppStatus
                return (
                    <Badge variant='outline' className={cn(sppStatusColors[status])}>
                        {sppStatusLabels[status]}
                    </Badge>
                )
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: 'tanggalBayar',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Tgl Bayar' />,
            cell: ({ row }) => (
                <span className='text-sm text-muted-foreground'>
                    {row.getValue('tanggalBayar') ?? (
                        <span className='flex items-center gap-1'>
                            <Clock className='size-3' /> Belum
                        </span>
                    )}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8 p-0 text-muted-foreground'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Buka menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => { }}>
                            <Pencil className='mr-2 h-4 w-4' /> Edit Transaksi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => { }}>
                            <Trash2 className='mr-2 h-4 w-4' /> Hapus Transaksi
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const table = useReactTable({
        data: payments,
        columns,
        state: { sorting, columnFilters, columnVisibility, pagination, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const clearSelection = () => table.resetRowSelection()

    const totalTagihan = payments.reduce((sum, p) => sum + p.nominal, 0)
    const totalDibayar = payments.reduce((sum, p) => sum + p.dibayar, 0)
    const sisaTunggakan = totalTagihan - totalDibayar

    const lunasCount = payments.filter((p) => p.status === 'paid').length
    const menunggakCount = payments.filter((p) => p.status === 'overdue').length
    const belumLunasCount = payments.filter((p) => p.status === 'unpaid' || p.status === 'partial').length

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <PageHeader title='Pembayaran Siswa' description='Kelola tagihan dan pembayaran SPP siswa.'>
                    <div className='flex gap-2'>
                        <Button variant='outline' className='gap-1.5' onClick={() => setDialog('import')}>
                            <Upload size={16} /> Import
                        </Button>
                        <Button variant='outline' className='gap-1.5' onClick={() => setDialog('export')}>
                            <Download size={16} /> Eksport
                        </Button>
                        <Button className='gap-1.5' onClick={() => navigate({ to: '/spp/tambah-pembayaran' })}>
                            <Receipt size={16} /> Tambah
                        </Button>
                    </div>
                </PageHeader>

                <div className='grid gap-4 sm:grid-cols-3'>
                    <StatCard title='Total Tagihan' value={formatRupiah(totalTagihan)} description='semester ini' icon={<Receipt className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Total Terbayar' value={formatRupiah(totalDibayar)} trend={{ value: `${Math.round((totalDibayar / totalTagihan) * 100)}%`, positive: true }} description='dari total tagihan' icon={<TrendingUp className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Sisa Tunggakan' value={formatRupiah(sisaTunggakan)} trend={{ value: 'perlu tindak lanjut', positive: false }} description='belum terbayar' icon={<AlertTriangle className='h-4 w-4 text-muted-foreground' />} />
                </div>

                <Suspense fallback={<div className='h-[400px] w-full animate-pulse rounded-xl bg-muted' />}>
                    <SppCharts
                        lunasCount={lunasCount}
                        menunggakCount={menunggakCount}
                        belumLunasCount={belumLunasCount}
                        totalTagihan={totalTagihan}
                        totalDibayar={totalDibayar}
                    />
                </Suspense>

                <Card>
                    <CardHeader className='space-y-4'>
                        <div>
                            <CardTitle>Daftar Pembayaran SPP</CardTitle>
                            <CardDescription>{table.getFilteredRowModel().rows.length} tagihan ditampilkan · semester genap 2025/2026</CardDescription>
                        </div>
                        <DataTableToolbar
                            table={table}
                            searchPlaceholder='Cari pendaftar...'
                            searchKey='namaSiswa'
                            filters={[
                                {
                                    columnId: 'status',
                                    title: 'Status',
                                    options: Object.entries(sppStatusLabels).map(([value, label]) => ({ label, value })),
                                },
                                {
                                    columnId: 'kelas',
                                    title: 'Kelas',
                                    options: kelasList.map((k) => ({ label: k, value: k })),
                                },
                            ]}
                        />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className='group/row'>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} colSpan={header.colSpan} className={cn('group-hover/row:bg-muted', header.column.columnDef.meta?.className)}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} className={cn('group-hover/row:bg-muted', cell.column.columnDef.meta?.className)}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className='h-24 text-center'>Tidak ada data pembayaran.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <DataTablePagination table={table} />
                    </CardContent>
                </Card>
            </Main>

            <div className={cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out', selectedRows.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none')}>
                <div className='flex items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-2xl ring-1 ring-border/40'>
                    <span className='font-semibold text-foreground text-sm'>{selectedRows.length}</span>
                    <div className='h-4 w-px bg-border' />
                    <Button size='sm' variant='outline' className='h-8 gap-1.5 text-xs' onClick={() => { }}>
                        <Send className='h-3.5 w-3.5' /> Kirim Notifikasi
                    </Button>
                    <Button size='sm' variant='outline' className='h-8 gap-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950' onClick={() => { }}>
                        <CheckSquare className='h-3.5 w-3.5' /> Tandai Lunas
                    </Button>
                    <Button size='icon' variant='ghost' className='h-8 w-8 text-muted-foreground hover:text-foreground' onClick={clearSelection}>
                        <X className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            <SppImportDialog open={dialog === 'import'} onOpenChange={(v) => setDialog(v ? 'import' : null)} />
            <SppExportDialog open={dialog === 'export'} onOpenChange={(v) => setDialog(v ? 'export' : null)} />
        </>
    )
}
