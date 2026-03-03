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
import { formatRupiah } from '@/lib/format'
import { Receipt } from 'lucide-react'

type PeriodeBayar = 'bulanan' | 'tahunan' | 'sekali'

type JenisBayarItem = {
    id: string
    kode: string
    nama: string
    nominal: number
    periode: PeriodeBayar
    keterangan: string
    aktif: boolean
}

const periodeConfig: Record<PeriodeBayar, { label: string; color: string }> = {
    bulanan: { label: 'Bulanan', color: 'bg-blue-100/30 text-blue-800 dark:text-blue-200 border-blue-200' },
    tahunan: { label: 'Tahunan', color: 'bg-purple-100/30 text-purple-800 dark:text-purple-200 border-purple-200' },
    sekali: { label: 'Sekali Bayar', color: 'bg-amber-100/30 text-amber-800 dark:text-amber-200 border-amber-200' },
}

const jenisBayarList: JenisBayarItem[] = [
    { id: '1', kode: 'SPP-MTS', nama: 'SPP MTs', nominal: 450000, periode: 'bulanan', keterangan: 'Sumbangan Pembinaan Pendidikan bulanan', aktif: true },
    { id: '2', kode: 'SPP-MA', nama: 'SPP MA', nominal: 500000, periode: 'bulanan', keterangan: 'Sumbangan Pembinaan Pendidikan MA', aktif: true },
    { id: '3', kode: 'PPDB-2026', nama: 'Biaya Pendaftaran PPDB', nominal: 150000, periode: 'sekali', keterangan: 'Biaya formulir dan seleksi PPDB', aktif: true },
    { id: '4', kode: 'DAFTAR-ULANG', nama: 'Daftar Ulang', nominal: 750000, periode: 'tahunan', keterangan: 'Biaya daftar ulang awal tahun ajaran', aktif: true },
    { id: '5', kode: 'SERAGAM', nama: 'Seragam Sekolah', nominal: 600000, periode: 'sekali', keterangan: 'Paket lengkap seragam (putih, batik, olahraga)', aktif: true },
    { id: '6', kode: 'BK-MATPEL', nama: 'Buku Mata Pelajaran', nominal: 350000, periode: 'tahunan', keterangan: 'Paket buku LKS dan referensi', aktif: true },
    { id: '7', kode: 'EKSKUL', nama: 'Kegiatan Ekstrakurikuler', nominal: 75000, periode: 'bulanan', keterangan: 'Biaya ekskul (futsal, pramuka, dll)', aktif: false },
    { id: '8', kode: 'WISATA', nama: 'Study Tour', nominal: 1200000, periode: 'sekali', keterangan: 'Biaya wisata tahunan kelas VIII', aktif: true },
    { id: '9', kode: 'UJIAN', nama: 'Biaya Ujian', nominal: 200000, periode: 'tahunan', keterangan: 'UN / UAS (termasuk kartu ujian)', aktif: true },
]

export function JenisBayar() {
    const aktifCount = jenisBayarList.filter((j) => j.aktif).length

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
                    title='Jenis Bayar'
                    description='Master data jenis pembayaran dan skema tarif madrasah.'
                />

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Receipt className='h-5 w-5' /> Daftar Jenis Pembayaran
                        </CardTitle>
                        <CardDescription>
                            {aktifCount} aktif dari {jenisBayarList.length} jenis pembayaran
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Jenis Bayar</TableHead>
                                        <TableHead className='text-right'>Nominal</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className='text-center'>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jenisBayarList.map((item) => {
                                        const pCfg = periodeConfig[item.periode]
                                        return (
                                            <TableRow key={item.id} className={!item.aktif ? 'opacity-60' : ''}>
                                                <TableCell className='font-mono text-sm font-medium'>{item.kode}</TableCell>
                                                <TableCell className='font-medium'>{item.nama}</TableCell>
                                                <TableCell className='text-right font-mono'>{formatRupiah(item.nominal)}</TableCell>
                                                <TableCell>
                                                    <Badge variant='outline' className={cn(pCfg.color)}>
                                                        {pCfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='max-w-[220px] truncate text-sm text-muted-foreground'>{item.keterangan}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Badge variant='outline' className={item.aktif ? 'border-green-200 bg-green-100/30 text-green-800 dark:text-green-200' : 'border-neutral-300 bg-neutral-100/30 text-neutral-500'}>
                                                        {item.aktif ? 'Aktif' : 'Nonaktif'}
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
