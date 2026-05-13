import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PageHeader } from '@/components/shared/page-header'
import { TeacherTable } from './components/teacher-table'
import { TeacherProvider } from './components/teacher-provider'
import { TeacherActionButtons } from './components/teacher-action-buttons'
import {
    TeacherDeactivateDialog,
    TeacherExportDialog,
    TeacherImportDialog,
} from './components/teacher-dialogs'
import { TeacherAddDialog } from './components/teacher-add-dialog'
import { useTeachers } from './hooks'

const route = getRouteApi('/_authenticated/teachers/')

export function DataTeacher() {
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const teachersQuery = useTeachers(search)

    const teacherData = teachersQuery.data?.data ?? []
    const teacherMeta = teachersQuery.data?.meta

    return (
        <TeacherProvider>
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
                >
                    <TeacherActionButtons />
                </PageHeader>
                <TeacherTable
                    data={teacherData}
                    search={search}
                    navigate={navigate}
                    totalRows={teacherMeta?.total ?? 0}
                    totalPages={teacherMeta?.totalPages ?? 0}
                    isLoading={teachersQuery.isLoading}
                    isFetching={teachersQuery.isFetching}
                    isError={teachersQuery.isError}
                />
            </Main>

            <TeacherAddDialog />
            <TeacherDeactivateDialog />
            <TeacherImportDialog />
            <TeacherExportDialog />
        </TeacherProvider>
    )
}
