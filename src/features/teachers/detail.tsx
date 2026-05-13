import { Link, useParams } from '@tanstack/react-router'
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Phone,
    UserCircle,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
    genderLabels,
    teacherStatusColors,
    teacherStatusLabels,
} from '@/lib/constants'
import { formatDateShort, formatDateTime, formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type TeacherEmploymentStatus, type TeacherRecord } from './data/schema'
import { useTeacherById } from './hooks'

const teacherEmploymentStatusLabels: Record<TeacherEmploymentStatus, string> = {
    tetap: 'Tetap',
    honorer: 'Honorer',
    gtt: 'GTT',
}

function getTextOrPlaceholder(value: string | null | undefined): string {
    const normalized = value?.trim()

    return normalized && normalized.length > 0 ? normalized : '-'
}

function formatOptionalDate(value: Date | null | undefined): string {
    return value ? formatDateShort(value) : '-'
}

function formatOptionalPhone(value: string | null | undefined): string {
    const resolved = getTextOrPlaceholder(value)

    return resolved === '-' ? resolved : formatPhone(resolved)
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getErrorMessage(error: unknown): string | null {
    if (!isObjectRecord(error)) {
        return null
    }

    return typeof error.message === 'string' && error.message.length > 0
        ? error.message
        : null
}

function isTeacherNotFoundError(error: unknown): boolean {
    if (!isObjectRecord(error)) {
        return false
    }

    if (typeof error.code === 'string' && error.code === 'NOT_FOUND') {
        return true
    }

    if (typeof error.message === 'string' && error.message.toLowerCase().includes('not found')) {
        return true
    }

    if (isObjectRecord(error.shape) && typeof error.shape.code === 'string') {
        return error.shape.code === 'NOT_FOUND'
    }

    if (isObjectRecord(error.data)) {
        if (typeof error.data.code === 'string' && error.data.code === 'NOT_FOUND') {
            return true
        }

        if (typeof error.data.httpStatus === 'number' && error.data.httpStatus === 404) {
            return true
        }
    }

    return false
}

function DetailField({
    label,
    value,
    className,
}: {
    label: string
    value: React.ReactNode
    className?: string
}) {
    return (
        <div className={className}>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <div className='mt-1 font-medium'>{value}</div>
        </div>
    )
}

function DetailTeacherLoading(): React.JSX.Element {
    return (
        <>
            <div className='flex items-center gap-3'>
                <Button variant='ghost' size='icon' asChild>
                    <Link to='/teachers'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <div className='flex-1 space-y-2'>
                    <Skeleton className='h-8 w-64' />
                    <Skeleton className='h-4 w-40' />
                </div>
                <Skeleton className='h-6 w-20 rounded-md' />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className='h-5 w-40' />
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-5/6' />
                            <Skeleton className='h-4 w-2/3' />
                            <Skeleton className='h-4 w-3/4' />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}

function DetailTeacherContent({ guru }: { guru: TeacherRecord }): React.JSX.Element {
    const teacherStatus = guru.isActive ? 'active' : 'inactive'

    return (
        <>
            <div className='flex items-center gap-3'>
                <Button variant='ghost' size='icon' asChild>
                    <Link to='/teachers'>
                        <ArrowLeft className='h-4 w-4' />
                    </Link>
                </Button>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>{guru.namaLengkap}</h2>
                    <p className='text-sm text-muted-foreground'>
                        NIP: {getTextOrPlaceholder(guru.nip)} · NIK: {guru.nik}
                    </p>
                </div>
                <Badge
                    variant='outline'
                    className={cn('ml-auto', teacherStatusColors[teacherStatus])}
                >
                    {teacherStatusLabels[teacherStatus]}
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
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DetailField label='Nama Lengkap' value={guru.namaLengkap} />
                            <DetailField label='Jenis Kelamin' value={genderLabels[guru.jenisKelamin]} />
                            <DetailField label='NIP' value={getTextOrPlaceholder(guru.nip)} />
                            <DetailField label='NIK' value={guru.nik} />
                            <DetailField
                                label='Tempat Lahir'
                                value={getTextOrPlaceholder(guru.tempatLahir)}
                            />
                            <DetailField
                                label='Tanggal Lahir'
                                value={formatOptionalDate(guru.tanggalLahir)}
                            />
                        </div>
                        <Separator />
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DetailField
                                label='No. Telepon'
                                value={
                                    <span className='flex items-center gap-1.5'>
                                        <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                                        <span>{formatOptionalPhone(guru.nomorHp)}</span>
                                    </span>
                                }
                            />
                            <DetailField
                                label='Alamat'
                                value={getTextOrPlaceholder(guru.alamat)}
                                className='sm:col-span-2'
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <BookOpen className='h-4 w-4' /> Informasi Mengajar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DetailField
                                label='Status Kepegawaian'
                                value={
                                    <Badge variant='outline' className='capitalize'>
                                        {teacherEmploymentStatusLabels[guru.statusKepegawaian]}
                                    </Badge>
                                }
                            />
                            <DetailField
                                label='Status Guru'
                                value={
                                    <Badge
                                        variant='outline'
                                        className={cn(
                                            'capitalize',
                                            teacherStatusColors[teacherStatus]
                                        )}
                                    >
                                        {teacherStatusLabels[teacherStatus]}
                                    </Badge>
                                }
                            />
                        </div>
                        <Separator />
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DetailField
                                label='Tanggal Bergabung'
                                value={formatOptionalDate(guru.tanggalBergabung)}
                            />
                            <DetailField
                                label='Mata Pelajaran'
                                className='sm:col-span-2'
                                value={
                                    guru.mataPelajaran.length > 0 ? (
                                        <div className='flex flex-wrap gap-1.5'>
                                            {guru.mataPelajaran.map((subject) => (
                                                <Badge
                                                    key={subject}
                                                    variant='outline'
                                                    className='text-nowrap'
                                                >
                                                    {subject}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className='text-muted-foreground'>-</span>
                                    )
                                }
                            />
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
                        <DetailField
                            label='Terdaftar pada'
                            value={formatDateTime(guru.createdAt)}
                        />
                        <DetailField
                            label='Terakhir diperbarui'
                            value={formatDateTime(guru.updatedAt)}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export function DetailTeacher(): React.JSX.Element {
    const { id } = useParams({ from: '/_authenticated/teachers/$id' })
    const teacherQuery = useTeacherById(id)
    const guru = teacherQuery.data

    const content = (() => {
        if (teacherQuery.isLoading) {
            return <DetailTeacherLoading />
        }

        if (teacherQuery.isError) {
            if (isTeacherNotFoundError(teacherQuery.error)) {
                return (
                    <>
                        <div className='flex items-center gap-3'>
                            <Button variant='ghost' size='icon' asChild>
                                <Link to='/teachers'>
                                    <ArrowLeft className='h-4 w-4' />
                                </Link>
                            </Button>
                            <div>
                                <h2 className='text-2xl font-bold tracking-tight'>Detail Guru</h2>
                                <p className='text-sm text-muted-foreground'>
                                    Data guru tidak ditemukan.
                                </p>
                            </div>
                        </div>

                        <EmptyState
                            icon={UserCircle}
                            title='Data guru tidak ditemukan'
                            description='Guru yang Anda cari tidak tersedia atau sudah tidak dapat diakses pada unit ini.'
                            className='min-h-[320px]'
                        />
                    </>
                )
            }

            return (
                <>
                    <div className='flex items-center gap-3'>
                        <Button variant='ghost' size='icon' asChild>
                            <Link to='/teachers'>
                                <ArrowLeft className='h-4 w-4' />
                            </Link>
                        </Button>
                        <div>
                            <h2 className='text-2xl font-bold tracking-tight'>Detail Guru</h2>
                            <p className='text-sm text-muted-foreground'>
                                Terjadi kendala saat memuat data guru.
                            </p>
                        </div>
                    </div>

                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Gagal memuat data guru</AlertTitle>
                        <AlertDescription>
                            {getErrorMessage(teacherQuery.error) ??
                                'Silakan coba beberapa saat lagi.'}
                        </AlertDescription>
                    </Alert>
                </>
            )
        }

        if (!guru) {
            return (
                <>
                    <div className='flex items-center gap-3'>
                        <Button variant='ghost' size='icon' asChild>
                            <Link to='/teachers'>
                                <ArrowLeft className='h-4 w-4' />
                            </Link>
                        </Button>
                        <div>
                            <h2 className='text-2xl font-bold tracking-tight'>Detail Guru</h2>
                            <p className='text-sm text-muted-foreground'>
                                Data guru tidak ditemukan.
                            </p>
                        </div>
                    </div>

                    <EmptyState
                        icon={UserCircle}
                        title='Data guru tidak ditemukan'
                        description='Guru yang Anda cari belum tersedia di sistem.'
                        className='min-h-[320px]'
                    />
                </>
            )
        }

        return <DetailTeacherContent guru={guru} />
    })()

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
                {content}
            </Main>
        </>
    )
}
