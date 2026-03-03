import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function JenisBayar() {
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
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Jenis Bayar</h2>
                        <p className='text-muted-foreground'>
                            Kelola jenis pembayaran dan skema tagihan.
                        </p>
                    </div>
                </div>
                <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed p-8'>
                    <div className='text-center'>
                        <h3 className='text-lg font-medium'>
                            Belum ada jenis pembayaran
                        </h3>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            Tambahkan jenis pembayaran pertama untuk memulai.
                        </p>
                    </div>
                </div>
            </Main>
        </>
    )
}
