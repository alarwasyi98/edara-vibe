import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useCashflowChart } from '../hooks'

const chartConfig = {
  income: {
    label: 'Pemasukan',
    color: 'hsl(var(--chart-1))',
  },
  expense: {
    label: 'Pengeluaran',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

function formatAxisValue(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}jt`
  if (value >= 1_000) return `${value / 1_000}rb`
  return `${value}`
}

export function SppCollectionChart() {
  const { data, isLoading } = useCashflowChart(6)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-sm text-muted-foreground">Belum ada data arus kas</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    month: item.month,
    income: parseFloat(item.income),
    expense: parseFloat(item.expense),
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatAxisValue}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Legend />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
