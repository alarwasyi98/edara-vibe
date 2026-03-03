import { useState } from 'react'
import { PlusCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { CalendarRange } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'
import { TahunAjaranDialog } from './components/tahun-ajaran-dialog'
import { TahunAjaranRowActions } from './components/tahun-ajaran-row-actions'

type TahunAjaranItem = {
    id: string
    nama: string
    mulai: string
    selesai: string
    semester: string
    status: 'active' | 'completed' | 'upcoming'
    keterangan?: string
}

const initialData: TahunAjaranItem[] = [
    { id: '1', nama: '2025/2026', mulai: '15 Juli 2025', selesai: '20 Juni 2026', semester: 'Genap (Jan–Jun 2026)', status: 'active', keterangan: 'Sedang berjalan' },
    { id: '2', nama: '2024/2025', mulai: '17 Juli 2024', selesai: '21 Juni 2025', semester: 'Genap & Ganjil', status: 'completed', keterangan: 'Sudah selesai' },
    { id: '3', nama: '2023/2024', mulai: '17 Juli 2023', selesai: '22 Juni 2024', semester: 'Genap & Ganjil', status: 'completed', keterangan: 'Sudah selesai' },
    { id: '4', nama: '2026/2027', mulai: '13 Juli 2026', selesai: '19 Juni 2027', semester: 'Belum dimulai', status: 'upcoming', keterangan: 'Tahun ajaran mendatang' },
]

const statusConfig = {
    active: { label: 'Aktif', color: 'bg-green-100/30 text-green-800 dark:text-green-200 border-green-200', icon: CheckCircle2 },
    completed: { label: 'Selesai', color: 'bg-neutral-100/30 text-neutral-600 dark:text-neutral-400 border-neutral-300', icon: BookOpen },
    upcoming: { label: 'Mendatang', color: 'bg-blue-100/30 text-blue-800 dark:text-blue-200 border-blue-200', icon: Clock },
}

export function TahunAjaran() {
    const [tahunList, setTahunList] = useState<TahunAjaranItem[]>(initialData)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
    const [selected, setSelected] = useState<TahunAjaranItem | undefined>()
    const [deleteTarget, setDeleteTarget] = useState<TahunAjaranItem | null>(null)

    const active = tahunList.find((t) => t.status === 'active')

    const handleAdd = () => {
        setDialogMode('add')
        setSelected(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (item: TahunAjaranItem) => {
        setDialogMode('edit')
        setSelected(item)
        setDialogOpen(true)
    }

    const handleActivate = (item: TahunAjaranItem) => {
        setTahunList((prev) =>
            prev.map((t) => ({
                ...t,
                status: t.id === item.id ? 'active' : t.status === 'active' ? 'completed' : t.status,
                keterangan: t.id === item.id ? 'Sedang berjalan' : t.status === 'active' ? 'Sudah selesai' : t.keterangan,
            }))
        )
        toast.success(`Tahun ajaran ${item.nama} diaktifkan. (Demo)`)
    }

    const handleSave = (data: Omit<TahunAjaranItem, 'id'>) => {
        if (dialogMode === 'add') {
            setTahunList((prev) => [...prev, { ...data, id: String(Date.now()) }])
        } else if (selected) {
            setTahunList((prev) => prev.map((t) => (t.id === selected.id ? { ...t, ...data } : t)))
        }
    }

    const confirmDelete = () => {
        if (!deleteTarget) return
        setTahunList((prev) => prev.filter((t) => t.id !== deleteTarget.id))
        toast.success(`Tahun ajaran ${deleteTarget.nama} dihapus. (Demo)`)
        setDeleteTarget(null)
    }

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
                <PageHeader
                    title='Tahun Ajaran'
                    description='Kelola tahun ajaran dan periode akademik madrasah.'
                >
                    <Button className='gap-1.5' onClick={handleAdd}>
                        <PlusCircle className='h-4 w-4' /> Tambah
                    </Button>
                </PageHeader>

                {active && (
                    <Card className='border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center gap-2'>
                                <CheckCircle2 className='h-5 w-5 text-green-600' />
                                <CardTitle className='text-green-800 dark:text-green-300'>
                                    Tahun Ajaran Aktif: {active.nama}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {active.mulai} — {active.selesai} · Semester: {active.semester}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <CalendarRange className='h-5 w-5' /> Daftar Tahun Ajaran
                        </CardTitle>
                        <CardDescription>{tahunList.length} tahun ajaran tercatat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tahun Ajaran</TableHead>
                                        <TableHead>Tanggal Mulai</TableHead>
                                        <TableHead>Tanggal Selesai</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className='w-12'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tahunList.map((ta) => {
                                        const cfg = statusConfig[ta.status]
                                        return (
                                            <TableRow key={ta.id}>
                                                <TableCell className='font-semibold'>{ta.nama}</TableCell>
                                                <TableCell className='text-sm'>{ta.mulai}</TableCell>
                                                <TableCell className='text-sm'>{ta.selesai}</TableCell>
                                                <TableCell className='text-sm text-muted-foreground'>{ta.semester}</TableCell>
                                                <TableCell>
                                                    <Badge variant='outline' className={cn('gap-1', cfg.color)}>
                                                        <cfg.icon className='h-3 w-3' />
                                                        {cfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='text-sm text-muted-foreground'>{ta.keterangan}</TableCell>
                                                <TableCell className='text-right'>
                                                    <TahunAjaranRowActions
                                                        item={ta}
                                                        onEdit={handleEdit}
                                                        onDelete={setDeleteTarget}
                                                        onActivate={handleActivate}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </Main>

            <TahunAjaranDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                initialData={selected}
                onSave={handleSave}
            />

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tahun ajaran <strong>{deleteTarget?.nama}</strong> akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
