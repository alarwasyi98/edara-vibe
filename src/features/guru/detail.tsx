import { useParams } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function DetailGuru() {
    const { id } = useParams({ from: '/_authenticated/guru/$id' })

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
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Detail Guru</h2>
                    <p className='text-muted-foreground'>ID: {id}</p>
                </div>
                <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed p-8'>
                    <p className='text-sm text-muted-foreground'>
                        Halaman detail guru akan ditampilkan di sini.
                    </p>
                </div>
            </Main>
        </>
    )
}
