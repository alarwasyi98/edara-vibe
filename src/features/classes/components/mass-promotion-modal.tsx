import { useMemo, useState } from 'react'
import { type CheckedState } from '@radix-ui/react-checkbox'
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { MassPromotionInput } from '@/lib/validators/classes'
import type {
  AcademicYearOption,
  ClassDetail,
  ClassStudent,
  ClassSummary,
} from '../types'

interface MassPromotionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceClass: ClassDetail | null
  targetAcademicYear: AcademicYearOption | null
  targetClasses: ClassSummary[]
  isTargetClassesLoading: boolean
  targetClassesErrorMessage?: string | null
  isPending: boolean
  onSubmit: (input: MassPromotionInput) => Promise<void>
}

type PromotionStep = 1 | 2 | 3

const stepItems: Array<{ step: PromotionStep; title: string }> = [
  { step: 1, title: 'Konfirmasi siswa' },
  { step: 2, title: 'Pilih kelas tujuan' },
  { step: 3, title: 'Ringkasan & konfirmasi' },
]

function groupPromotionsByTargetClass(
  students: ClassStudent[],
  targetByStudentId: Record<string, string>,
  targetClasses: ClassSummary[],
) {
  const grouped = new Map<string, { classItem: ClassSummary; students: ClassStudent[] }>()
  const targetClassMap = new Map(targetClasses.map((classItem) => [classItem.id, classItem]))

  for (const student of students) {
    const targetClassId = targetByStudentId[student.studentId]
    const classItem = targetClassMap.get(targetClassId)

    if (!classItem) {
      continue
    }

    const existing = grouped.get(classItem.id)

    if (existing) {
      existing.students.push(student)
      continue
    }

    grouped.set(classItem.id, {
      classItem,
      students: [student],
    })
  }

  return Array.from(grouped.values())
}

function getAvailableTargetClasses(
  sourceClass: ClassDetail | null,
  targetClasses: ClassSummary[],
): ClassSummary[] {
  if (!sourceClass) {
    return targetClasses
  }

  const matchingGrade = targetClasses.filter(
    (classItem) => classItem.gradeLevel === sourceClass.gradeLevel + 1,
  )

  return matchingGrade.length > 0 ? matchingGrade : targetClasses
}

function createInitialPromotionState(
  sourceClass: ClassDetail | null,
  availableTargetClasses: ClassSummary[],
): {
  step: PromotionStep
  selectedStudentIds: string[]
  targetByStudentId: Record<string, string>
} {
  const defaultTargetClassId = availableTargetClasses[0]?.id ?? ''
  const studentIds = sourceClass?.students.map((student) => student.studentId) ?? []

  return {
    step: 1,
    selectedStudentIds: studentIds,
    targetByStudentId: Object.fromEntries(
      studentIds.map((studentId) => [studentId, defaultTargetClassId]),
    ),
  }
}

interface MassPromotionModalContentProps extends MassPromotionModalProps {
  availableTargetClasses: ClassSummary[]
}

function MassPromotionModalContent({
  open,
  onOpenChange,
  sourceClass,
  targetAcademicYear,
  targetClasses: _targetClasses,
  isTargetClassesLoading,
  targetClassesErrorMessage,
  isPending,
  onSubmit,
  availableTargetClasses,
}: MassPromotionModalContentProps) {
  const [promotionState, setPromotionState] = useState(() =>
    createInitialPromotionState(sourceClass, availableTargetClasses),
  )
  const { step, selectedStudentIds, targetByStudentId } = promotionState

  const setStep = (nextStep: PromotionStep) => {
    setPromotionState((current) => ({ ...current, step: nextStep }))
  }

  const setSelectedStudentIds = (
    updater: string[] | ((current: string[]) => string[]),
  ) => {
    setPromotionState((current) => ({
      ...current,
      selectedStudentIds:
        typeof updater === 'function' ? updater(current.selectedStudentIds) : updater,
    }))
  }

  const setTargetByStudentId = (
    updater:
      | Record<string, string>
      | ((current: Record<string, string>) => Record<string, string>),
  ) => {
    setPromotionState((current) => ({
      ...current,
      targetByStudentId:
        typeof updater === 'function' ? updater(current.targetByStudentId) : updater,
    }))
  }

  const selectedStudents = useMemo(
    () =>
      sourceClass?.students.filter((student) =>
        selectedStudentIds.includes(student.studentId),
      ) ?? [],
    [selectedStudentIds, sourceClass],
  )

  const groupedSummary = useMemo(
    () =>
      groupPromotionsByTargetClass(
        selectedStudents,
        targetByStudentId,
        availableTargetClasses,
      ),
    [availableTargetClasses, selectedStudents, targetByStudentId],
  )

  const canProceedToStepTwo = selectedStudents.length > 0
  const canProceedToStepThree =
    selectedStudents.length > 0 &&
    selectedStudents.every((student) => {
      const targetClassId = targetByStudentId[student.studentId]
      return targetClassId.length > 0
    }) &&
    availableTargetClasses.length > 0

  const handleSelectAllStudents = (checked: CheckedState) => {
    if (!sourceClass) {
      return
    }

    setSelectedStudentIds(
      checked === true ? sourceClass.students.map((student) => student.studentId) : [],
    )
  }

  const handleToggleStudent = (studentId: string, checked: CheckedState) => {
    setSelectedStudentIds((current) => {
      if (checked === true) {
        return current.includes(studentId) ? current : [...current, studentId]
      }

      return current.filter((item) => item !== studentId)
    })
  }

  const handleConfirm = async () => {
    if (!sourceClass || !targetAcademicYear) {
      return
    }

    await onSubmit({
      sourceClassId: sourceClass.id,
      targetAcademicYearId: targetAcademicYear.id,
      promotions: selectedStudents.map((student) => ({
        studentId: student.studentId,
        targetClassId: targetByStudentId[student.studentId],
      })),
    })

    onOpenChange(false)
  }

  const allStudentsChecked =
    sourceClass !== null &&
    sourceClass.students.length > 0 &&
    selectedStudentIds.length === sourceClass.students.length
  const someStudentsChecked =
    selectedStudentIds.length > 0 &&
    selectedStudentIds.length < (sourceClass?.students.length ?? 0)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Kenaikan Kelas Massal</DialogTitle>
          <DialogDescription>
            {sourceClass && targetAcademicYear
              ? `Promosikan siswa dari ${sourceClass.name} ke tahun ajaran ${targetAcademicYear.name}.`
              : 'Siapkan data siswa dan kelas tujuan sebelum melanjutkan.'}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-2 sm:grid-cols-3'>
          {stepItems.map((item) => (
            <div
              key={item.step}
              className={cn(
                'rounded-lg border px-4 py-3',
                step === item.step
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30',
              )}
            >
              <p className='text-xs font-medium text-muted-foreground'>
                Langkah {item.step}
              </p>
              <p className='text-sm font-medium'>{item.title}</p>
            </div>
          ))}
        </div>

        {!sourceClass ? (
          <div className='flex min-h-60 items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
            Memuat detail kelas...
          </div>
        ) : step === 1 ? (
          <div className='flex flex-col gap-4'>
            <Alert>
              <AlertTitle>Pilih siswa yang akan dipromosikan</AlertTitle>
              <AlertDescription>
                Semua siswa aktif dicentang otomatis. Hapus centang untuk siswa yang belum ikut kenaikan kelas.
              </AlertDescription>
            </Alert>

            <div className='flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3'>
              <div>
                <p className='text-sm font-medium'>{sourceClass.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {sourceClass.students.length} siswa aktif tersedia.
                </p>
              </div>

              <label className='flex items-center gap-2 text-sm font-medium'>
                <Checkbox
                  checked={
                    allStudentsChecked
                      ? true
                      : someStudentsChecked
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={handleSelectAllStudents}
                />
                Pilih semua
              </label>
            </div>

            <ScrollArea className='max-h-[420px] rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-14'>Pilih</TableHead>
                    <TableHead>Nama siswa</TableHead>
                    <TableHead>NIS / NISN</TableHead>
                    <TableHead>Data wali</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceClass.students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                        Belum ada siswa aktif di kelas ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sourceClass.students.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudentIds.includes(student.studentId)}
                            onCheckedChange={(checked) =>
                              handleToggleStudent(student.studentId, checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{student.namaLengkap}</span>
                            <span className='text-xs text-muted-foreground'>
                              {student.status}
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
                          <div className='flex flex-col'>
                            <span>{student.namaWali ?? '-'}</span>
                            <span>{student.nomorHpWali ?? '-'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ) : step === 2 ? (
          <div className='flex flex-col gap-4'>
            <Alert>
              <AlertTitle>Tentukan kelas tujuan tiap siswa</AlertTitle>
              <AlertDescription>
                Sistem menampilkan kelas pada tahun ajaran berikutnya. Anda bisa membagi siswa ke beberapa kelas tujuan.
              </AlertDescription>
            </Alert>

            {isTargetClassesLoading ? (
              <div className='flex min-h-60 items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
                Memuat daftar kelas tujuan...
              </div>
            ) : targetClassesErrorMessage ? (
              <Alert variant='destructive'>
                <AlertTriangle />
                <AlertTitle>Gagal memuat kelas tujuan</AlertTitle>
                <AlertDescription>{targetClassesErrorMessage}</AlertDescription>
              </Alert>
            ) : availableTargetClasses.length === 0 ? (
              <Alert variant='destructive'>
                <AlertTriangle />
                <AlertTitle>Kelas tujuan belum tersedia</AlertTitle>
                <AlertDescription>
                  Buat kelas di tahun ajaran {targetAcademicYear?.name ?? '-'} sebelum menjalankan kenaikan kelas massal.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className='max-h-[420px] rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama siswa</TableHead>
                      <TableHead>Asal kelas</TableHead>
                      <TableHead>Kelas tujuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{student.namaLengkap}</span>
                            <span className='text-xs text-muted-foreground'>
                              {student.nisn ?? student.nis ?? '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {sourceClass.name}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={targetByStudentId[student.studentId] ?? ''}
                            onValueChange={(value) =>
                              setTargetByStudentId((current) => ({
                                ...current,
                                [student.studentId]: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Pilih kelas tujuan' />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTargetClasses.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.name} · Kelas {classItem.gradeLevel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <Alert variant='destructive'>
              <AlertTriangle />
              <AlertTitle>Aksi ini tidak dapat dibatalkan</AlertTitle>
              <AlertDescription>
                Pastikan seluruh siswa dan kelas tujuan sudah sesuai sebelum mengonfirmasi kenaikan kelas massal.
              </AlertDescription>
            </Alert>

            <div className='grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
              <ScrollArea className='max-h-[360px] rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Kelas tujuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStudents.map((student) => {
                      const targetClass = availableTargetClasses.find(
                        (classItem) => classItem.id === targetByStudentId[student.studentId],
                      )

                      return (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <div className='flex flex-col'>
                              <span className='font-medium'>{student.namaLengkap}</span>
                              <span className='text-xs text-muted-foreground'>
                                {student.nisn ?? student.nis ?? '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {targetClass
                              ? `${targetClass.name} · Kelas ${targetClass.gradeLevel}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className='rounded-lg border bg-muted/20 p-4'>
                <p className='text-sm font-semibold'>Ringkasan distribusi</p>
                <div className='mt-4 flex flex-col gap-3'>
                  {groupedSummary.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      Belum ada kelas tujuan yang dipilih.
                    </p>
                  ) : (
                    groupedSummary.map((group) => (
                      <div
                        key={group.classItem.id}
                        className='rounded-md border bg-background p-3'
                      >
                        <p className='text-sm font-medium'>
                          {group.classItem.name} · Kelas {group.classItem.gradeLevel}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {group.students.length} siswa tujuan
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              if (step === 1) {
                onOpenChange(false)
                return
              }

              setStep(step === 2 ? 1 : 2)
            }}
            disabled={isPending}
          >
            {step === 1 ? (
              'Batal'
            ) : (
              <>
                <ChevronLeft data-icon='inline-start' />
                Kembali
              </>
            )}
          </Button>

          {step < 3 ? (
            <Button
              type='button'
              onClick={() => setStep(step === 1 ? 2 : 3)}
              disabled={
                isPending ||
                (step === 1 ? !canProceedToStepTwo : !canProceedToStepThree)
              }
            >
              Lanjut
              <ChevronRight data-icon='inline-end' />
            </Button>
          ) : (
            <Button type='button' onClick={handleConfirm} disabled={isPending}>
              {isPending && <Loader2 data-icon='inline-start' className='animate-spin' />}
              Konfirmasi Kenaikan Kelas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MassPromotionModal({
  open,
  onOpenChange,
  sourceClass,
  targetAcademicYear,
  targetClasses,
  isTargetClassesLoading,
  targetClassesErrorMessage,
  isPending,
  onSubmit,
}: MassPromotionModalProps) {
  const availableTargetClasses = useMemo(
    () => getAvailableTargetClasses(sourceClass, targetClasses),
    [sourceClass, targetClasses],
  )

  const modalKey = useMemo(
    () =>
      [
        sourceClass?.id ?? 'no-class',
        targetAcademicYear?.id ?? 'no-year',
        availableTargetClasses.map((classItem) => classItem.id).join(','),
      ].join('::'),
    [availableTargetClasses, sourceClass?.id, targetAcademicYear?.id],
  )

  return (
    <MassPromotionModalContent
      key={modalKey}
      open={open}
      onOpenChange={onOpenChange}
      sourceClass={sourceClass}
      targetAcademicYear={targetAcademicYear}
      targetClasses={targetClasses}
      isTargetClassesLoading={isTargetClassesLoading}
      targetClassesErrorMessage={targetClassesErrorMessage}
      isPending={isPending}
      onSubmit={onSubmit}
      availableTargetClasses={availableTargetClasses}
    />
  )
}
