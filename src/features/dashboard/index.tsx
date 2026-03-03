import {
  GraduationCap,
  UserCheck,
  Receipt,
  AlertTriangle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StatCard } from '@/components/shared/stat-card'
import { useTenant } from '@/hooks/use-tenant'
import { formatRupiah } from '@/lib/format'
import { SppCollectionChart } from './components/overview'
import { RecentPayments } from './components/recent-sales'
import { Analytics } from './components/analytics'

export function Dashboard() {
  const { activeTenant } = useTenant()

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>{activeTenant.name}</p>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Ringkasan</TabsTrigger>
              <TabsTrigger value='analytics'>Analitik</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                title='Total Siswa Aktif'
                value='248'
                trend={{ value: '+12 bulan ini', positive: true }}
                description='3 rombel baru'
                icon={
                  <GraduationCap className='h-4 w-4 text-muted-foreground' />
                }
              />
              <StatCard
                title='Guru & Staff'
                value='32'
                trend={{ value: '+2 semester ini', positive: true }}
                description='28 aktif mengajar'
                icon={
                  <UserCheck className='h-4 w-4 text-muted-foreground' />
                }
              />
              <StatCard
                title='Penerimaan SPP Bulan Ini'
                value={formatRupiah(38600000)}
                trend={{ value: '+8.2%', positive: true }}
                description='vs bulan lalu'
                icon={
                  <Receipt className='h-4 w-4 text-muted-foreground' />
                }
              />
              <StatCard
                title='Tunggakan SPP'
                value={formatRupiah(12450000)}
                trend={{ value: '18 siswa', positive: false }}
                description='perlu tindak lanjut'
                icon={
                  <AlertTriangle className='h-4 w-4 text-muted-foreground' />
                }
              />
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Penerimaan SPP</CardTitle>
                  <CardDescription>
                    Total penerimaan SPP bulanan tahun ajaran 2025/2026
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <SppCollectionChart />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Pembayaran Terbaru</CardTitle>
                  <CardDescription>
                    5 pembayaran SPP terakhir hari ini.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentPayments />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
