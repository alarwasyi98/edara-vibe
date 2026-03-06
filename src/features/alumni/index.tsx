import { GraduationCap } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'

export function Alumni() {
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
                <PageHeader
                    title='Data Alumni'
                    description='Kelola data siswa yang telah lulus dari madrasah.'
                />
                <EmptyState
                    icon={GraduationCap}
                    title='Belum ada data alumni'
                    description='Data alumni akan ditampilkan di sini setelah fitur ini diaktifkan. Anda dapat mengimpor data dari tahun ajaran sebelumnya.'
                    actionLabel='Impor Data Alumni'
                />
            </Main>
        </>
    )
}
