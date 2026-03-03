import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: React.ReactNode
    trend?: {
        value: string
        positive: boolean
    }
    className?: string
}

/**
 * KPI stat card untuk dashboard.
 * Menampilkan metrik utama (total siswa, saldo, tunggakan, dll).
 *
 * @example
 * <StatCard
 *   title="Total Siswa Aktif"
 *   value="248"
 *   description="3 kampus"
 *   trend={{ value: "+12 bulan ini", positive: true }}
 *   icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
 * />
 */
export function StatCard({
    title,
    value,
    description,
    icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                {icon && (
                    <div className='text-muted-foreground'>{icon}</div>
                )}
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>{value}</div>
                {(description || trend) && (
                    <p className='text-xs text-muted-foreground'>
                        {trend && (
                            <span
                                className={cn(
                                    'font-medium',
                                    trend.positive
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {trend.value}
                            </span>
                        )}
                        {trend && description && ' · '}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
