import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description?: string
    children?: React.ReactNode
    className?: string
}

/**
 * Header halaman standar. Digunakan di setiap halaman modul.
 * `children` diletakkan di sisi kanan (biasanya tombol aksi).
 *
 * @example
 * <PageHeader title="Data Siswa" description="Kelola data siswa madrasah Anda.">
 *   <Button>Tambah Siswa</Button>
 * </PageHeader>
 */
export function PageHeader({
    title,
    description,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-end justify-between gap-2',
                className
            )}
        >
            <div>
                <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
                {description && (
                    <p className='text-muted-foreground'>{description}</p>
                )}
            </div>
            {children && <div className='flex items-center gap-2'>{children}</div>}
        </div>
    )
}
