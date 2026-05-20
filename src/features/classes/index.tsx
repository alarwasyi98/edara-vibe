import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Plus,
  Shapes,
  UserCheck,
  Users,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { ThemeSwitch } from '@/components/theme-switch'
import { orpc } from '@/lib/orpc-react'
import type { CreateClassInput, MassPromotionInput } from '@/lib/validators/classes'
import { ClassGrid } from './components/class-grid'
import { ClassesDialog } from './components/classes-dialog'
import { MassPromotionModal } from './components/mass-promotion-modal'
import {
  useClasses,
  useCreateClass,
  useMassPromotion,
  useUpdateClass,
} from './hooks'
import type { AcademicYearOption, ClassDetail, ClassSummary, TeacherOption } from './types'

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

const teacherListInput = {
  page: 1,
  pageSize: 100,
  search: '',
  statusKepegawaian: [],
  mataPelajaran: [],
  includeInactive: false,
} as const

function getProgressPercentage(total: number, capacity: number): number {
  if (capacity <= 0) {
    return 0
  }

  return Math.round((total / capacity) * 100)
}

function findNextAcademicYear(
  academicYears: AcademicYearOption[],
  selectedAcademicYear: AcademicYearOption | null,
): AcademicYearOption | null {
  if (!selectedAcademicYear) {
    return null
  }

  const selectedStartTime = new Date(selectedAcademicYear.startDate).getTime()

  return (
    academicYears
      .filter(
        (year) =>
          year.id !== selectedAcademicYear.id &&
          new Date(year.startDate).getTime() > selectedStartTime,
      )
      .sort(
        (left, right) =>
          new Date(left.startDate).getTime() - new Date(right.startDate).getTime(),
      )[0] ?? null
  )
}

function flattenClasses(classGroups: ClassSummary[][]): ClassSummary[] {
  return classGroups.flatMap((group) => group)
}

function renderClassDetailLoading() {
  return (
    <Card>
      <CardHeader className='gap-3'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-64' />
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
        </div>
        <Skeleton className='h-64' />
      </CardContent>
    </Card>
  )
}

export function DataKelas() {
  const navigate = useNavigate()
  const { history } = useRouter()

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingClass, setEditingClass] = useState<ClassSummary | null>(null)
  const [promotionOpen, setPromotionOpen] = useState(false)

  const academicYearsQuery = useQuery(orpc.tenant.academicYears.list.queryOptions({}))
  const teachersQuery = useQuery(
    orpc.tenant.teachers.list.queryOptions({ input: teacherListInput }),
  )

  const academicYears = useMemo(
    () => (academicYearsQuery.data ?? []) as AcademicYearOption[],
    [academicYearsQuery.data],
  )
  const activeAcademicYear = academicYears.find((year) => year.isActive) ?? null

  const effectiveSelectedAcademicYearId =
    selectedAcademicYearId ?? activeAcademicYear?.id ?? academicYears[0]?.id ?? null
  const selectedAcademicYear =
    academicYears.find((year) => year.id === effectiveSelectedAcademicYearId) ?? null

  const classesQuery = useClasses(
    selectedAcademicYear?.id,
    Boolean(selectedAcademicYear),
  )
  const nextAcademicYear = useMemo(
    () => findNextAcademicYear(academicYears, selectedAcademicYear),
    [academicYears, selectedAcademicYear],
  )
  const targetClassesQuery = useClasses(nextAcademicYear?.id, Boolean(nextAcademicYear))

  const classGroups = useMemo(
    () => classesQuery.data?.grades ?? [],
    [classesQuery.data],
  )
  const allClasses = useMemo(
    () => flattenClasses(classGroups.map((group) => group.classes)),
    [classGroups],
  )

  const effectiveSelectedClassId = useMemo(() => {
    if (allClasses.length === 0) {
      return null
    }

    const nextSelectedClass = allClasses.find(
      (classItem) => classItem.id === selectedClassId,
    )

    return nextSelectedClass?.id ?? allClasses[0]?.id ?? null
  }, [allClasses, selectedClassId])

  const classDetailQuery = useQuery({
    ...orpc.tenant.classes.getById.queryOptions({
      input: { id: effectiveSelectedClassId ?? EMPTY_UUID },
    }),
    enabled: Boolean(effectiveSelectedClassId),
  })

  const classDetail = (classDetailQuery.data ?? null) as ClassDetail | null
  const targetClasses = useMemo(
    () =>
      flattenClasses(
        (targetClassesQuery.data?.grades ?? []).map((group) => group.classes),
      ),
    [targetClassesQuery.data],
  )

  const teacherOptions = useMemo<TeacherOption[]>(
    () =>
      (teachersQuery.data?.data ?? []).map((teacher) => ({
        id: teacher.id,
        label: teacher.namaLengkap,
      })),
    [teachersQuery.data],
  )

  const totalStudents = classGroups.reduce(
    (sum, group) => sum + group.totalStudents,
    0,
  )
  const assignedHomeroomCount = allClasses.filter(
    (classItem) => classItem.homeroomTeacherId !== null,
  ).length
  const occupancyAverage =
    allClasses.length === 0
      ? 0
      : Math.round(
          allClasses.reduce(
            (sum, classItem) =>
              sum + getProgressPercentage(classItem.activeStudentCount, classItem.capacity),
            0,
          ) / allClasses.length,
        )

  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()
  const massPromotionMutation = useMassPromotion()

  const isDialogPending = createClassMutation.isPending || updateClassMutation.isPending
  const isClassesEmpty = !classesQuery.isLoading && allClasses.length === 0

  const handleAddClass = () => {
    setDialogMode('add')
    setEditingClass(null)
    setDialogOpen(true)
  }

  const handleEditClass = (classItem: ClassSummary) => {
    setDialogMode('edit')
    setEditingClass(classItem)
    setDialogOpen(true)
  }

  const handleClassSubmit = async (input: CreateClassInput) => {
    if (dialogMode === 'edit' && editingClass) {
      const updatedClass = await updateClassMutation.mutateAsync({
        id: editingClass.id,
        ...input,
      })

      setSelectedClassId(updatedClass.id)
      setDialogOpen(false)
      setEditingClass(null)
      return
    }

    const createdClass = await createClassMutation.mutateAsync(input)

    setSelectedClassId(createdClass.id)
    setDialogOpen(false)
    setEditingClass(null)
  }

  const handleMassPromotion = async (input: MassPromotionInput) => {
    await massPromotionMutation.mutateAsync(input)
    setPromotionOpen(false)
  }

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
          title='Data Kelas'
          description='Kelola kelas per tahun pelajaran, lihat siswa aktif, dan jalankan kenaikan kelas massal.'
        >
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <Select
              value={selectedAcademicYear?.id}
              onValueChange={(value) => {
                setSelectedAcademicYearId(value)
                setSelectedClassId(null)
              }}
              disabled={academicYearsQuery.isLoading || academicYears.length === 0}
            >
              <SelectTrigger className='w-full sm:w-56'>
                <SelectValue placeholder='Pilih tahun pelajaran' />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((academicYear) => (
                  <SelectItem key={academicYear.id} value={academicYear.id}>
                    {academicYear.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAddClass} disabled={!selectedAcademicYear}>
              <Plus data-icon='inline-start' />
              Tambah Kelas
            </Button>
          </div>
        </PageHeader>

        {(academicYearsQuery.isError || teachersQuery.isError || classesQuery.isError) && (
          <Alert variant='destructive'>
            <AlertTitle>Gagal memuat data kelas</AlertTitle>
            <AlertDescription>
              {academicYearsQuery.error?.message ??
                teachersQuery.error?.message ??
                classesQuery.error?.message ??
                'Terjadi kesalahan saat memuat data kelas.'}
            </AlertDescription>
          </Alert>
        )}

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            title='Tahun Pelajaran'
            value={selectedAcademicYear?.name ?? '-'}
            description={selectedAcademicYear?.isActive ? 'Sedang aktif' : 'Arsip / nonaktif'}
            icon={<BookOpen className='h-4 w-4' />}
          />
          <StatCard
            title='Total Kelas'
            value={classesQuery.data?.totalClasses ?? 0}
            description='Tersusun per tingkat'
            icon={<Shapes className='h-4 w-4' />}
          />
          <StatCard
            title='Siswa Aktif'
            value={totalStudents}
            description='Terdaftar di kelas terpilih'
            icon={<Users className='h-4 w-4' />}
          />
          <StatCard
            title='Rata-rata Okupansi'
            value={`${occupancyAverage}%`}
            description={`${assignedHomeroomCount} kelas sudah punya wali kelas`}
            icon={<UserCheck className='h-4 w-4' />}
          />
        </div>

        {!selectedAcademicYear && !academicYearsQuery.isLoading ? (
          <Card className='border-dashed'>
            <CardContent className='flex flex-col items-center gap-4 py-12 text-center'>
              <div className='space-y-2'>
                <h2 className='text-lg font-semibold'>Belum ada tahun pelajaran</h2>
                <p className='max-w-lg text-sm text-muted-foreground'>
                  Buat tahun pelajaran terlebih dahulu agar kelas bisa dikelola dari frontend live.
                </p>
              </div>
              <Button onClick={() => navigate({ to: '/academic-years' })}>
                <ArrowRight data-icon='inline-start' />
                Kelola Tahun Pelajaran
              </Button>
            </CardContent>
          </Card>
        ) : classesQuery.isLoading ? (
          <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index}>
                <CardHeader className='gap-3'>
                  <Skeleton className='h-5 w-28' />
                  <Skeleton className='h-4 w-20' />
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                  <Skeleton className='h-10' />
                  <Skeleton className='h-8' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isClassesEmpty ? (
          <Card className='border-dashed'>
            <CardContent className='py-12'>
              <div className='flex flex-col items-center gap-4 text-center'>
                <GraduationCap className='size-12 text-muted-foreground' />
                <div className='space-y-2'>
                  <h2 className='text-lg font-semibold'>Belum ada kelas untuk tahun pelajaran ini</h2>
                  <p className='max-w-lg text-sm text-muted-foreground'>
                    Tambahkan kelas baru untuk {selectedAcademicYear?.name ?? 'tahun pelajaran terpilih'} atau kembali ke halaman sebelumnya.
                  </p>
                </div>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <Button variant='outline' onClick={() => history.go(-1)}>
                    Kembali
                  </Button>
                  <Button onClick={() => navigate({ to: '/' })}>Ke Beranda</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ClassGrid
            grades={classGroups}
            selectedClassId={effectiveSelectedClassId}
            onSelectClass={setSelectedClassId}
            onEditClass={handleEditClass}
          />
        )}

        {effectiveSelectedClassId && (
          classDetailQuery.isLoading ? renderClassDetailLoading() : classDetailQuery.isError ? (
            <Alert variant='destructive'>
              <AlertTitle>Gagal memuat detail kelas</AlertTitle>
              <AlertDescription>
                {classDetailQuery.error.message}
              </AlertDescription>
            </Alert>
          ) : classDetail ? (
            <Card>
              <CardHeader className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div className='space-y-1'>
                  <CardTitle>{classDetail.name}</CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    {classDetail.academicYearName} · Wali kelas {classDetail.homeroomTeacherName ?? 'belum ditentukan'}
                  </p>
                </div>

                {nextAcademicYear && (
                  <Button
                    onClick={() => setPromotionOpen(true)}
                    disabled={classDetail.students.length === 0}
                  >
                    <ArrowRight data-icon='inline-start' />
                    Kenaikan Kelas Massal
                  </Button>
                )}
              </CardHeader>

              <CardContent className='flex flex-col gap-6'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Tingkat Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-semibold'>Kelas {classDetail.gradeLevel}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Siswa Aktif</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-semibold'>{classDetail.activeStudentCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium'>Kapasitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-semibold'>{classDetail.capacity}</div>
                      <p className='text-xs text-muted-foreground'>
                        {classDetail.remainingCapacity >= 0
                          ? `Sisa ${classDetail.remainingCapacity} kursi`
                          : `Lebih ${Math.abs(classDetail.remainingCapacity)} siswa`}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {classDetail.students.length === 0 ? (
                  <EmptyState
                    title='Belum ada siswa aktif di kelas ini'
                    description='Kelas sudah live, tetapi belum ada enrollment aktif yang terhubung pada tahun pelajaran ini.'
                  />
                ) : (
                  <div className='rounded-lg border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama siswa</TableHead>
                          <TableHead>NIS / NISN</TableHead>
                          <TableHead>Nama wali</TableHead>
                          <TableHead>Nomor HP wali</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classDetail.students.map((student) => (
                          <TableRow key={student.enrollmentId}>
                            <TableCell>
                              <div className='flex flex-col'>
                                <span className='font-medium'>{student.namaLengkap}</span>
                                <span className='text-xs text-muted-foreground'>
                                  Enrollment aktif
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              <div className='flex flex-col'>
                                <span>{student.nis ?? '-'}</span>
                                <span>{student.nisn ?? '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {student.namaWali ?? '-'}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {student.nomorHpWali ?? '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null
        )}
      </Main>

      <ClassesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        academicYearId={selectedAcademicYear?.id ?? ''}
        academicYearName={selectedAcademicYear?.name ?? 'Tahun pelajaran belum tersedia'}
        teachers={teacherOptions}
        isTeachersLoading={teachersQuery.isLoading}
        initialData={editingClass}
        isPending={isDialogPending}
        onSubmit={handleClassSubmit}
      />

        <MassPromotionModal
          open={promotionOpen}
          onOpenChange={setPromotionOpen}
          sourceClass={classDetail}
          targetAcademicYear={nextAcademicYear}
          targetClasses={targetClasses}
          isTargetClassesLoading={targetClassesQuery.isLoading}
          targetClassesErrorMessage={
            targetClassesQuery.isError ? targetClassesQuery.error.message : null
          }
          isPending={massPromotionMutation.isPending}
          onSubmit={handleMassPromotion}
        />
    </>
  )
}
