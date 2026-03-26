import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from '@/components/ui/chart'
import { formatRupiah } from '@/lib/format'

const pieConfig: ChartConfig = {
    lunas: { label: 'Lunas', color: 'hsl(142 71% 45%)' },
    menunggak: { label: 'Menunggak', color: 'hsl(0 72% 51%)' },
    belumLunas: { label: 'Belum Lunas', color: 'hsl(38 92% 50%)' },
}

const lineConfig: ChartConfig = {
    terbayar: { label: 'Terbayar', color: 'hsl(142 71% 45%)' },
    tagihan: { label: 'Total Tagihan', color: 'hsl(215 20% 65%)' },
}

interface SppChartsProps {
    lunasCount: number
    menunggakCount: number
    belumLunasCount: number
    totalTagihan: number
    totalDibayar: number
}

export default function SppCharts({
    lunasCount,
    menunggakCount,
    belumLunasCount,
    totalTagihan,
    totalDibayar,
}: SppChartsProps) {
    const pieData = [
        { name: 'lunas', value: lunasCount, fill: 'var(--color-lunas)' },
        { name: 'menunggak', value: menunggakCount, fill: 'var(--color-menunggak)' },
        { name: 'belumLunas', value: belumLunasCount, fill: 'var(--color-belumLunas)' },
    ]

    const trendData = [
        { bulan: 'Jan', terbayar: 28500000, tagihan: 37500000 },
        { bulan: 'Feb', terbayar: 31200000, tagihan: 37500000 },
        { bulan: 'Mar', terbayar: 29750000, tagihan: 37500000 },
        { bulan: 'Apr', terbayar: 33100000, tagihan: 37500000 },
        { bulan: 'Mei', terbayar: 35400000, tagihan: 37500000 },
        { bulan: 'Jun', terbayar: totalDibayar, tagihan: totalTagihan },
    ]

    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Status Pembayaran Siswa</CardTitle>
                    <CardDescription>
                        {lunasCount} lunas · {menunggakCount} menunggak · {belumLunasCount} belum lunas
                    </CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-center'>
                    <ChartContainer
                        config={pieConfig}
                        className='h-[260px] w-full max-w-[320px] sm:max-w-none'
                    >
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        nameKey='name'
                                        formatter={(value, name) => (
                                            <div className='flex items-center justify-between gap-4 w-full'>
                                                <span className='text-muted-foreground'>
                                                    {pieConfig[name as keyof typeof pieConfig]?.label ?? name}
                                                </span>
                                                <span className='font-mono font-medium'>
                                                    {Number(value)} siswa
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Pie
                                data={pieData}
                                dataKey='value'
                                nameKey='name'
                                cx='50%'
                                cy='50%'
                                innerRadius='35%'
                                outerRadius='60%'
                                paddingAngle={3}
                                strokeWidth={2}
                            >
                                {pieData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey='name' />}
                            />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tren Pembayaran Bulanan</CardTitle>
                    <CardDescription>Perbandingan tagihan vs terbayar Jan–Jun 2026</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={lineConfig} className='h-[260px] w-full'>
                        <LineChart
                            data={trendData}
                            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray='3 3'
                                vertical={false}
                                className='stroke-border'
                            />
                            <XAxis
                                dataKey='bulan'
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) =>
                                    `${(v / 1_000_000).toFixed(0)}M`
                                }
                                width={40}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => (
                                            <div className='flex items-center justify-between gap-4 w-full'>
                                                <span className='text-muted-foreground'>
                                                    {lineConfig[name as keyof typeof lineConfig]?.label ?? name}
                                                </span>
                                                <span className='font-mono font-medium'>
                                                    {formatRupiah(Number(value))}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Line
                                type='monotone'
                                dataKey='tagihan'
                                stroke='var(--color-tagihan)'
                                strokeWidth={2}
                                strokeDasharray='4 4'
                                dot={false}
                            />
                            <Line
                                type='monotone'
                                dataKey='terbayar'
                                stroke='var(--color-terbayar)'
                                strokeWidth={2.5}
                                dot={{ r: 3, strokeWidth: 2 }}
                                activeDot={{ r: 5 }}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
