import { Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ClassesRowActions } from './kelas-row-actions'
import type { ClassGradeGroup, ClassSummary } from '../types'

interface ClassGridProps {
  grades: ClassGradeGroup[]
  selectedClassId: string | null
  onSelectClass: (classId: string) => void
  onEditClass: (classItem: ClassSummary) => void
}

function getCapacityTone(ratio: number) {
  if (ratio >= 1) {
    return {
      bar: 'bg-destructive',
      track: 'bg-destructive/15',
      text: 'text-destructive',
    }
  }

  if (ratio >= 0.8) {
    return {
      bar: 'bg-amber-500',
      track: 'bg-amber-500/15',
      text: 'text-amber-600',
    }
  }

  return {
    bar: 'bg-emerald-500',
    track: 'bg-emerald-500/15',
    text: 'text-emerald-600',
  }
}

function getInitials(name: string | null): string {
  if (!name) {
    return '--'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ClassGrid({
  grades,
  selectedClassId,
  onSelectClass,
  onEditClass,
}: ClassGridProps) {
  return (
    <div className='flex flex-col gap-6'>
      {grades.map((grade) => (
        <section key={grade.gradeLevel} className='flex flex-col gap-4'>
          <div>
            <h2 className='text-lg font-semibold'>
              Kelas {grade.gradeLevel} · {grade.totalClasses} Kelas
            </h2>
            <p className='text-sm text-muted-foreground'>
              {grade.totalStudents} siswa aktif pada tingkat ini.
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {grade.classes.map((classItem) => {
              const ratio = classItem.capacity === 0
                ? 0
                : classItem.activeStudentCount / classItem.capacity
              const tone = getCapacityTone(ratio)

              return (
                <Card
                  key={classItem.id}
                  className={cn(
                    'cursor-pointer border transition-colors hover:border-primary/40',
                    selectedClassId === classItem.id &&
                      'border-primary ring-1 ring-primary/20',
                  )}
                  onClick={() => onSelectClass(classItem.id)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelectClass(classItem.id)
                    }
                  }}
                >
                  <CardHeader className='flex flex-row items-start justify-between gap-3 pb-3'>
                    <div className='space-y-1'>
                      <CardTitle className='text-base'>{classItem.name}</CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        Tingkat {classItem.gradeLevel}
                      </p>
                    </div>

                    <ClassesRowActions
                      kelas={classItem}
                      onEdit={onEditClass}
                      onViewStudents={(selected) => onSelectClass(selected.id)}
                    />
                  </CardHeader>

                  <CardContent className='flex flex-col gap-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-6'>
                        <AvatarFallback className='text-[10px] font-medium'>
                          {getInitials(classItem.homeroomTeacherName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium'>
                          {classItem.homeroomTeacherName ?? 'Belum ada wali kelas'}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          Wali kelas
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between gap-3 text-sm'>
                        <span className='inline-flex items-center gap-2 text-muted-foreground'>
                          <Users className='size-4' />
                          {classItem.activeStudentCount}/{classItem.capacity} siswa
                        </span>
                        <span className={cn('text-xs font-medium', tone.text)}>
                          {classItem.remainingCapacity >= 0
                            ? `Sisa ${classItem.remainingCapacity} kursi`
                            : `Lebih ${Math.abs(classItem.remainingCapacity)} siswa`}
                        </span>
                      </div>
                      <div className={cn('h-2 overflow-hidden rounded-full', tone.track)}>
                        <div
                          className={cn('h-full rounded-full transition-all', tone.bar)}
                          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
