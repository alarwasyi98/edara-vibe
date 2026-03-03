import { CalendarRange, CheckCircle2, Clock, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { cn } from '@/lib/utils'

type TahunAjaranItem = {
    id: string
    nama: string
    mulai: string
    selesai: string
    semester: string
    status: 'active' | 'completed' | 'upcoming'
    keterangan?: string
}

const dataTahunAjaran: TahunAjaranItem[] = [
    {
        id: '1',
        nama: '2025/2026',
        mulai: '15 Juli 2025',
        selesai: '20 Juni 2026',
        semester: 'Genap (Jan–Jun 2026)',
        status: 'active',
        keterangan: 'Sedang berjalan',
    },
    {
        id: '2',
        nama: '2024/2025',
        mulai: '17 Juli 2024',
        selesai: '21 Juni 2025',
        semester: 'Genap & Ganjil',
        status: 'completed',
        keterangan: 'Sudah selesai',
    },
    {
        id: '3',
        nama: '2023/2024',
        mulai: '17 Juli 2023',
        selesai: '22 Juni 2024',
        semester: 'Genap & Ganjil',
        status: 'completed',
        keterangan: 'Sudah selesai',
    },
    {
        id: '4',
        nama: '2026/2027',
        mulai: '13 Juli 2026',
        selesai: '19 Juni 2027',
        semester: 'Belum dimulai',
        status: 'upcoming',
        keterangan: 'Tahun ajaran mendatang',
    },
]

const statusConfig = {
    active: { label: 'Aktif', color: 'bg-green-100/30 text-green-800 dark:text-green-200 border-green-200', icon: CheckCircle2 },
    completed: { label: 'Selesai', color: 'bg-neutral-100/30 text-neutral-600 dark:text-neutral-400 border-neutral-300', icon: BookOpen },
    upcoming: { label: 'Mendatang', color: 'bg-blue-100/30 text-blue-800 dark:text-blue-200 border-blue-200', icon: Clock },
}

export function TahunAjaran() {
    const active = dataTahunAjaran.find((t) => t.status === 'active')

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
                />

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
                        <CardDescription>{dataTahunAjaran.length} tahun ajaran tercatat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tahun Ajaran</TableHead>
                                        <TableHead>Tanggal Mulai</TableHead>
                                        <TableHead>Tanggal Selesai</TableHead>
                                        <TableHead>Semester Berjalan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataTahunAjaran.map((ta) => {
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
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}
