import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    label: string
    colorClass?: string
    className?: string
}

/**
 * Badge status reusable. Cocok untuk status siswa, SPP, PPDB, guru, dll.
 * Gunakan bersama statusColors dari constants.ts.
 *
 * @example
 * <StatusBadge
 *   label={studentStatusLabels[student.status]}
 *   colorClass={studentStatusColors[student.status]}
 * />
 */
export function StatusBadge({
    label,
    colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                colorClass,
                className
            )}
        >
            {label}
        </span>
    )
}
