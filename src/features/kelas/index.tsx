import { BookOpen, Users, UserCheck, TrendingUp } from 'lucide-react'
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
import { StatCard } from '@/components/shared/stat-card'

type Kelas = {
    id: string
    namaKelas: string
    jenjang: 'VII' | 'VIII' | 'IX'
    waliKelas: string
    jumlahSiswa: number
    kapasitas: number
    tahunAjaran: string
}

const dataKelas: Kelas[] = [
    { id: '1', namaKelas: 'VII-A', jenjang: 'VII', waliKelas: 'Ustdzh. Fatimah Hidayatullah', jumlahSiswa: 32, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '2', namaKelas: 'VII-B', jenjang: 'VII', waliKelas: 'Ibu Sari Nugroho', jumlahSiswa: 30, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '3', namaKelas: 'VII-C', jenjang: 'VII', waliKelas: 'Ustadz Ahmad Maulana', jumlahSiswa: 28, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '4', namaKelas: 'VIII-A', jenjang: 'VIII', waliKelas: 'Pak Budi Santoso', jumlahSiswa: 33, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '5', namaKelas: 'VIII-B', jenjang: 'VIII', waliKelas: 'Ibu Dewi Permana', jumlahSiswa: 31, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '6', namaKelas: 'VIII-C', jenjang: 'VIII', waliKelas: 'Ustadz Ridwan Hakim', jumlahSiswa: 29, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '7', namaKelas: 'IX-A', jenjang: 'IX', waliKelas: 'Ibu Ratna Wibowo', jumlahSiswa: 34, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '8', namaKelas: 'IX-B', jenjang: 'IX', waliKelas: 'Pak Eko Kurniawan', jumlahSiswa: 30, kapasitas: 35, tahunAjaran: '2025/2026' },
    { id: '9', namaKelas: 'IX-C', jenjang: 'IX', waliKelas: 'Ustdz. Zahra Firdaus', jumlahSiswa: 27, kapasitas: 35, tahunAjaran: '2025/2026' },
]

const totalSiswa = dataKelas.reduce((s, k) => s + k.jumlahSiswa, 0)

const jenjangColor: Record<string, string> = {
    VII: 'bg-blue-100/30 text-blue-800 dark:text-blue-200 border-blue-200',
    VIII: 'bg-amber-100/30 text-amber-800 dark:text-amber-200 border-amber-200',
    IX: 'bg-emerald-100/30 text-emerald-800 dark:text-emerald-200 border-emerald-200',
}

export function DataKelas() {
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
                    title='Data Kelas'
                    description='Kelola kelas dan rombongan belajar madrasah.'
                />

                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <StatCard title='Total Kelas' value={`${dataKelas.length}`} description='aktif TA 2025/2026' icon={<BookOpen className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Total Siswa' value={`${totalSiswa}`} description='seluruh kelas' icon={<Users className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Wali Kelas' value={`${dataKelas.length}`} description='guru yang bertugas' icon={<UserCheck className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Rata-rata Siswa' value={`${Math.round(totalSiswa / dataKelas.length)}`} description='per kelas' icon={<TrendingUp className='h-4 w-4 text-muted-foreground' />} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kelas</CardTitle>
                        <CardDescription>Tahun ajaran 2025/2026</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Kelas</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead>Wali Kelas</TableHead>
                                        <TableHead className='text-center'>Siswa</TableHead>
                                        <TableHead className='text-center'>Kapasitas</TableHead>
                                        <TableHead className='text-center'>Terisi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataKelas.map((kelas) => {
                                        const pct = Math.round((kelas.jumlahSiswa / kelas.kapasitas) * 100)
                                        return (
                                            <TableRow key={kelas.id}>
                                                <TableCell className='font-medium'>{kelas.namaKelas}</TableCell>
                                                <TableCell>
                                                    <Badge variant='outline' className={jenjangColor[kelas.jenjang]}>
                                                        Kelas {kelas.jenjang}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='text-sm'>{kelas.waliKelas}</TableCell>
                                                <TableCell className='text-center font-mono'>{kelas.jumlahSiswa}</TableCell>
                                                <TableCell className='text-center font-mono text-muted-foreground'>{kelas.kapasitas}</TableCell>
                                                <TableCell className='text-center'>
                                                    <span className={pct >= 90 ? 'font-medium text-amber-600' : 'text-muted-foreground'}>
                                                        {pct}%
                                                    </span>
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
        </>
    )
}
