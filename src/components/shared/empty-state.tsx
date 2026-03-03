import { cn } from '@/lib/utils'
import { InboxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    icon?: React.ElementType
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    className?: string
}

/**
 * Komponen empty state yang konsisten.
 * Tampil saat data kosong di tabel, list, atau detail page.
 *
 * @example
 * <EmptyState
 *   title="Belum ada data siswa"
 *   description="Tambahkan siswa pertama untuk memulai."
 *   actionLabel="Tambah Siswa"
 *   onAction={() => setOpenDialog(true)}
 * />
 */
export function EmptyState({
    icon: Icon = InboxIcon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-1 items-center justify-center rounded-lg border border-dashed p-8',
                className
            )}
        >
            <div className='flex flex-col items-center text-center'>
                <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                    <Icon className='size-6 text-muted-foreground' />
                </div>
                <h3 className='mt-4 text-lg font-medium'>{title}</h3>
                {description && (
                    <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
                        {description}
                    </p>
                )}
                {actionLabel && onAction && (
                    <Button onClick={onAction} className='mt-4' size='sm'>
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}
