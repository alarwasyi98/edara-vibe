import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { SiswaTable } from './components/siswa-table'
import { SiswaActionButtons } from './components/siswa-action-buttons'
import { SiswaProvider } from './components/siswa-provider'
import { SiswaImportDialog, SiswaExportDialog, SiswaDeleteDialog } from './components/siswa-dialogs'
import { SiswaAddDialog } from './components/siswa-add-dialog'
import { students } from './data/students'

const route = getRouteApi('/_authenticated/siswa/')

export function DataSiswa() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    return (
        <SiswaProvider>
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
                    title='Data Siswa'
                    description='Kelola data peserta didik madrasah.'
                >
                    <SiswaActionButtons />
                </PageHeader>

                <SiswaTable data={students} search={search} navigate={navigate} />
            </Main>

            <SiswaImportDialog />
            <SiswaExportDialog />
            <SiswaDeleteDialog />
            <SiswaAddDialog />
        </SiswaProvider>
    )
}
