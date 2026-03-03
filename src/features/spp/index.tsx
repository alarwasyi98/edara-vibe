import { faker } from '@faker-js/faker'
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
import { Receipt, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

faker.seed(99999)

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

const bulanList = [
    '2026-01',
    '2026-02',
    '2026-03',
    '2026-04',
    '2026-05',
    '2026-06',
]

const siswaNames = [
    'Ahmad Rizki F.',
    'Nisa Putri Ayu',
    'Muhammad Faqih',
    'Siti Aminah',
    'Hasan Ridwan',
    'Zahra Khadijah',
    'Bayu Pratama',
    'Fatimah Azzahra',
    'Irfan Maulana',
    'Layla Rahma',
    'Galih Nugroho',
    'Annisa Dewi',
    'Rafi Hidayat',
    'Salma Utami',
    'Dani Kurniawan',
]

const kelasList = [
    'VII-A',
    'VII-B',
    'VII-C',
    'VIII-A',
    'VIII-B',
    'VIII-C',
    'IX-A',
    'IX-B',
    'IX-C',
]

const payments: SppPayment[] = Array.from({ length: 50 }, () => {
    const nominal = 450000
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
        dibayar:
            status === 'paid'
                ? nominal
                : status === 'partial'
                    ? Math.floor(nominal * 0.5)
                    : 0,
        status,
        tanggalBayar:
            status === 'paid' || status === 'partial'
                ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
                : null,
    }
})

const totalTagihan = payments.reduce((sum, p) => sum + p.nominal, 0)
const totalDibayar = payments.reduce((sum, p) => sum + p.dibayar, 0)
const lunas = payments.filter((p) => p.status === 'paid').length
const menunggak = payments.filter(
    (p) => p.status === 'overdue' || p.status === 'unpaid'
).length

export function ManajemenSPP() {
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
                    title='Pembayaran Siswa'
                    description='Kelola tagihan dan pembayaran SPP siswa.'
                />

                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <StatCard
                        title='Total Tagihan'
                        value={formatRupiah(totalTagihan)}
                        description='semester ini'
                        icon={<Receipt className='h-4 w-4 text-muted-foreground' />}
                    />
                    <StatCard
                        title='Total Terbayar'
                        value={formatRupiah(totalDibayar)}
                        trend={{
                            value: `${Math.round((totalDibayar / totalTagihan) * 100)}%`,
                            positive: true,
                        }}
                        description='dari total tagihan'
                        icon={<CheckCircle className='h-4 w-4 text-muted-foreground' />}
                    />
                    <StatCard
                        title='Lunas'
                        value={`${lunas} siswa`}
                        icon={<CheckCircle className='h-4 w-4 text-muted-foreground' />}
                    />
                    <StatCard
                        title='Menunggak'
                        value={`${menunggak} siswa`}
                        trend={{ value: 'perlu tindak lanjut', positive: false }}
                        icon={
                            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
                        }
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pembayaran SPP</CardTitle>
                        <CardDescription>
                            50 tagihan terbaru semester genap 2025/2026
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Siswa</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Bulan</TableHead>
                                        <TableHead className='text-right'>Tagihan</TableHead>
                                        <TableHead className='text-right'>Dibayar</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tgl Bayar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.slice(0, 20).map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className='font-medium'>
                                                {p.namaSiswa}
                                            </TableCell>
                                            <TableCell>{p.kelas}</TableCell>
                                            <TableCell>{formatBulanTagihan(p.bulan)}</TableCell>
                                            <TableCell className='text-right font-mono'>
                                                {formatRupiah(p.nominal)}
                                            </TableCell>
                                            <TableCell className='text-right font-mono'>
                                                {formatRupiah(p.dibayar)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant='outline'
                                                    className={cn(sppStatusColors[p.status])}
                                                >
                                                    {sppStatusLabels[p.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-sm text-muted-foreground'>
                                                {p.tanggalBayar ?? (
                                                    <span className='flex items-center gap-1'>
                                                        <Clock className='size-3' /> Belum
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}
