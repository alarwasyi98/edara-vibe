import { notFound } from '@tanstack/react-router'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, UserCircle, Phone, MapPin, GraduationCap, CalendarDays, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { formatDateShort, formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { students } from './data/students'
import { statusColorMap, statusOptions } from './data/data'

const genderFullLabel: Record<'L' | 'P', string> = {
    L: 'Laki-laki',
    P: 'Perempuan',
}

export function DetailSiswa() {
    const { id } = useParams({ from: '/_authenticated/siswa/$id' })
    const siswa = students.find((s) => s.id === id)

    if (!siswa) throw notFound()

    const statusColor = statusColorMap.get(siswa.status)
    const statusLabel = statusOptions.find((s) => s.value === siswa.status)?.label ?? siswa.status

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
                <div className='flex items-center gap-3'>
                    <Button variant='ghost' size='icon' asChild>
                        <Link to='/siswa'>
                            <ArrowLeft className='h-4 w-4' />
                        </Link>
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>{siswa.namaLengkap}</h2>
                        <p className='text-sm text-muted-foreground'>NIS: {siswa.nis} · NISN: {siswa.nisn}</p>
                    </div>
                    <Badge variant='outline' className={cn('ml-auto', statusColor)}>
                        {statusLabel}
                    </Badge>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-base'>
                                <UserCircle className='h-4 w-4' /> Identitas Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Nama Lengkap</p>
                                    <p className='font-medium'>{siswa.namaLengkap}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Jenis Kelamin</p>
                                    <p className='font-medium'>{genderFullLabel[siswa.jenisKelamin]}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Tempat Lahir</p>
                                    <p className='font-medium'>{siswa.tempatLahir}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Tanggal Lahir</p>
                                    <p className='font-medium'>{formatDateShort(siswa.tanggalLahir)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className='text-xs text-muted-foreground'>Alamat</p>
                                <p className='flex items-start gap-1.5 font-medium'>
                                    <MapPin className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                                    {siswa.alamat}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-base'>
                                <GraduationCap className='h-4 w-4' /> Informasi Akademik
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-xs text-muted-foreground'>NIS</p>
                                    <p className='font-mono font-medium'>{siswa.nis}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>NISN</p>
                                    <p className='font-mono font-medium'>{siswa.nisn}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Kelas</p>
                                    <Badge variant='outline'>{siswa.kelas}</Badge>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Tahun Masuk</p>
                                    <p className='font-medium'>{siswa.tahunMasuk}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Status</p>
                                    <Badge variant='outline' className={cn(statusColor)}>{statusLabel}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-base'>
                                <Users className='h-4 w-4' /> Data Orang Tua / Wali
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-xs text-muted-foreground'>Nama Wali</p>
                                    <p className='font-medium'>{siswa.namaWali}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground'>No. Telepon</p>
                                    <p className='flex items-center gap-1.5 font-medium'>
                                        <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                                        {formatPhone(siswa.teleponWali)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-base'>
                                <CalendarDays className='h-4 w-4' /> Riwayat Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div>
                                <p className='text-xs text-muted-foreground'>Terdaftar pada</p>
                                <p className='font-medium'>{formatDateShort(siswa.createdAt)}</p>
                            </div>
                            <div>
                                <p className='text-xs text-muted-foreground'>Terakhir diperbarui</p>
                                <p className='font-medium'>{formatDateShort(siswa.updatedAt)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    )
}
