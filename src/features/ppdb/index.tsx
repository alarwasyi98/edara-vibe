import { faker } from '@faker-js/faker'
import { cn } from '@/lib/utils'
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
import { formatDateShort } from '@/lib/format'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'

faker.seed(22222)

type PpdbStatus = 'diterima' | 'ditolak' | 'pending' | 'verifikasi'

const statusConfig: Record<PpdbStatus, { label: string; color: string }> = {
    diterima: { label: 'Diterima', color: 'bg-green-100/30 text-green-800 dark:text-green-200 border-green-200' },
    ditolak: { label: 'Ditolak', color: 'bg-red-100/30 text-red-800 dark:text-red-200 border-red-200' },
    pending: { label: 'Menunggu', color: 'bg-amber-100/30 text-amber-800 dark:text-amber-200 border-amber-200' },
    verifikasi: { label: 'Verifikasi', color: 'bg-blue-100/30 text-blue-800 dark:text-blue-200 border-blue-200' },
}

const firstNamesL = ['Ahmad', 'Muhammad', 'Rizki', 'Fauzan', 'Hasan', 'Zaki', 'Dani', 'Rafi', 'Bayu', 'Ilham']
const firstNamesP = ['Siti', 'Nisa', 'Aisyah', 'Fatimah', 'Zahra', 'Putri', 'Dewi', 'Rahma', 'Layla', 'Salma']
const lastNames = ['Hidayat', 'Pratama', 'Nugroho', 'Ramadhani', 'Permana', 'Santoso', 'Kurniawan', 'Maulana', 'Hakim']
const sdList = ['SDN 01 Jakarta', 'MI Al-Hikmah', 'SDN 03 Bandung', 'MIN 1 Bekasi', 'SD Muhammadiyah', 'SDN Cikaret', 'MI Darul Ulum']

const applicants = Array.from({ length: 40 }, (_, i) => {
    const gender = faker.helpers.arrayElement(['L', 'P'] as const)
    const firstName = faker.helpers.arrayElement(gender === 'L' ? firstNamesL : firstNamesP)
    const lastName = faker.helpers.arrayElement(lastNames)
    return {
        id: faker.string.uuid(),
        noPendaftaran: `PPDB-2026-${String(i + 1).padStart(3, '0')}`,
        nama: `${firstName} ${lastName}`,
        jenisKelamin: gender,
        asalSekolah: faker.helpers.arrayElement(sdList),
        tanggalDaftar: faker.date.between({ from: '2026-01-01', to: '2026-03-01' }),
        nilaiRata: faker.number.float({ min: 75, max: 100, fractionDigits: 1 }),
        status: faker.helpers.weightedArrayElement([
            { weight: 4, value: 'diterima' as PpdbStatus },
            { weight: 1, value: 'ditolak' as PpdbStatus },
            { weight: 2, value: 'pending' as PpdbStatus },
            { weight: 1, value: 'verifikasi' as PpdbStatus },
        ]),
    }
})

const total = applicants.length
const diterima = applicants.filter((a) => a.status === 'diterima').length
const ditolak = applicants.filter((a) => a.status === 'ditolak').length
const pending = applicants.filter((a) => a.status === 'pending' || a.status === 'verifikasi').length

export function DataPPDB() {
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
                    title='PPDB 2026/2027'
                    description='Penerimaan Peserta Didik Baru — pantau status pendaftaran calon siswa.'
                />

                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <StatCard title='Total Pendaftar' value={`${total}`} icon={<Users className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Diterima' value={`${diterima}`} trend={{ value: `${Math.round((diterima / total) * 100)}%`, positive: true }} icon={<CheckCircle className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Ditolak' value={`${ditolak}`} icon={<XCircle className='h-4 w-4 text-muted-foreground' />} />
                    <StatCard title='Menunggu / Verifikasi' value={`${pending}`} icon={<Clock className='h-4 w-4 text-muted-foreground' />} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pendaftar</CardTitle>
                        <CardDescription>40 calon siswa baru TA 2026/2027</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No. Pendaftaran</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>L/P</TableHead>
                                        <TableHead>Asal Sekolah</TableHead>
                                        <TableHead className='text-right'>Nilai Rata-rata</TableHead>
                                        <TableHead>Tgl. Daftar</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.map((a) => {
                                        const cfg = statusConfig[a.status]
                                        return (
                                            <TableRow key={a.id}>
                                                <TableCell className='font-mono text-sm'>{a.noPendaftaran}</TableCell>
                                                <TableCell className='font-medium'>{a.nama}</TableCell>
                                                <TableCell>{a.jenisKelamin}</TableCell>
                                                <TableCell className='text-sm text-muted-foreground'>{a.asalSekolah}</TableCell>
                                                <TableCell className='text-right font-mono'>{a.nilaiRata.toFixed(1)}</TableCell>
                                                <TableCell className='text-sm'>{formatDateShort(a.tanggalDaftar)}</TableCell>
                                                <TableCell>
                                                    <Badge variant='outline' className={cn(cfg.color)}>
                                                        {cfg.label}
                                                    </Badge>
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
