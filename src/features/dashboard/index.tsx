import { Link } from '@tanstack/react-router'
import {
  GraduationCap,
  UserCheck,
  Receipt,
  Activity,
  CalendarClock,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StatCard } from '@/components/shared/stat-card'
import { useTenant } from '@/hooks/use-tenant'
import { formatRupiah, formatDate } from '@/lib/format'
import { SppCollectionChart } from './components/overview'
import { RecentPayments } from './components/recent-sales'
import {
  useSummaryCards,
  useUpcomingEvents,
  useRecentActivity,
} from './hooks'

export function Dashboard() {
  const { activeAssignment } = useTenant()
  
  const summaryCards = useSummaryCards()
  const upcomingEvents = useUpcomingEvents()
  const recentActivity = useRecentActivity()

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

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>{activeAssignment?.schoolName ?? 'No school assigned'}</p>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList variant='line'>
              <TabsTrigger value='overview'>Ringkasan</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {summaryCards.isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </Card>
                  ))}
                </>
              ) : summaryCards.data ? (
                <>
                  <StatCard
                    title='Total Siswa Aktif'
                    value={summaryCards.data.totalActiveStudents.toString()}
                    icon={
                      <GraduationCap className='h-4 w-4 text-muted-foreground' />
                    }
                  />
                  <StatCard
                    title='Total Guru Aktif'
                    value={summaryCards.data.totalActiveTeachers.toString()}
                    icon={
                      <UserCheck className='h-4 w-4 text-muted-foreground' />
                    }
                  />
                  <StatCard
                    title='Penerimaan SPP Bulan Ini'
                    value={formatRupiah(parseFloat(summaryCards.data.sppIncomeThisMonth))}
                    trend={
                      summaryCards.data.sppIncomeDeltaPercent
                        ? {
                            value: `${parseFloat(summaryCards.data.sppIncomeDeltaPercent) > 0 ? '+' : ''}${parseFloat(summaryCards.data.sppIncomeDeltaPercent).toFixed(1)}%`,
                            positive: parseFloat(summaryCards.data.sppIncomeDeltaPercent) > 0,
                          }
                        : undefined
                    }
                    description='vs bulan lalu'
                    icon={
                      <Receipt className='h-4 w-4 text-muted-foreground' />
                    }
                  />
                </>
              ) : null}
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Arus Kas</CardTitle>
                    <CardDescription>
                      Pemasukan dan pengeluaran 6 bulan terakhir
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className='ps-2 pt-4'>
                  <SppCollectionChart />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>Pembayaran Terbaru</CardTitle>
                    <CardDescription>
                      5 pembayaran SPP terakhir hari ini.
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/spp">Lihat Selengkapnya</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <RecentPayments />
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Activity className='h-4 w-4' /> Log Aktivitas
                    </CardTitle>
                    <CardDescription>Aktivitas pengguna terkini di sistem</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/settings">Lihat Selengkapnya</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {recentActivity.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentActivity.data && recentActivity.data.length > 0 ? (
                    <ul className='space-y-3'>
                      {recentActivity.data.map((log) => (
                        <li key={log.id} className='flex items-start gap-3'>
                          <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted'>
                            <Activity className='h-3.5 w-3.5 text-muted-foreground' />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm'>
                              <span className='font-medium'>{log.actorName}</span>{' '}
                              <span className='text-muted-foreground'>{log.description}</span>
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {formatDate(log.createdAt, 'relative')}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Belum ada aktivitas
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <CalendarClock className='h-4 w-4' /> Kegiatan Mendatang
                    </CardTitle>
                    <CardDescription>Jadwal acara dan tenggat yang akan datang</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/events">Lihat Selengkapnya</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : upcomingEvents.data && upcomingEvents.data.length > 0 ? (
                    <ul className='space-y-3'>
                      {upcomingEvents.data.map((ev) => (
                        <li key={ev.id} className='flex items-start gap-3'>
                          <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted'>
                            <CalendarClock className='h-3.5 w-3.5 text-muted-foreground' />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium'>{ev.name}</p>
                            <p className='text-xs text-muted-foreground'>
                              {ev.startDate ? formatDate(ev.startDate) : 'Tanggal belum ditentukan'}
                              {ev.location && ` · ${ev.location}`}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Tidak ada kegiatan mendatang
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
