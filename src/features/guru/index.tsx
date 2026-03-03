import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { GuruTable } from './components/guru-table'
import { teachers } from './data/teachers'

const route = getRouteApi('/_authenticated/guru/')

export function DataGuru() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

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
                    title='Data Guru'
                    description='Kelola data guru dan tenaga pengajar.'
                />
                <GuruTable data={teachers} search={search} navigate={navigate} />
            </Main>
        </>
    )
}
