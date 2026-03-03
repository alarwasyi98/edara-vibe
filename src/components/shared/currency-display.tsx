import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/format'

interface CurrencyDisplayProps {
    amount: number
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Menampilkan angka dalam format Rupiah (Rp 350.000).
 */
export function CurrencyDisplay({
    amount,
    className,
    size = 'md',
}: CurrencyDisplayProps) {
    return (
        <span
            className={cn(
                'font-mono tabular-nums',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg font-semibold',
                className
            )}
        >
            {formatRupiah(amount)}
        </span>
    )
}
