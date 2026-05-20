import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClassSchema, type CreateClassInput } from '@/lib/validators/classes'
import type { ClassSummary, TeacherOption } from '../types'

const UNASSIGNED_HOMEROOM = 'unassigned'

const classFormSchema = z.object({
  name: createClassSchema.shape.name,
  gradeLevel: z.coerce.number().pipe(createClassSchema.shape.gradeLevel),
  homeroomTeacherId: z.string().uuid().or(z.literal(UNASSIGNED_HOMEROOM)),
  capacity: z.coerce.number().pipe(createClassSchema.shape.capacity),
})

type ClassFormValues = z.infer<typeof classFormSchema>
type ClassesDialogMode = 'add' | 'edit'

interface ClassesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ClassesDialogMode
  academicYearId: string
  academicYearName: string
  teachers: TeacherOption[]
  isTeachersLoading: boolean
  initialData?: ClassSummary | null
  isPending: boolean
  onSubmit: (data: CreateClassInput) => Promise<void>
}

export function ClassesDialog({
  open,
  onOpenChange,
  mode,
  academicYearId,
  academicYearName,
  teachers,
  isTeachersLoading,
  initialData,
  isPending,
  onSubmit,
}: ClassesDialogProps) {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      gradeLevel: 7,
      homeroomTeacherId: UNASSIGNED_HOMEROOM,
      capacity: 32,
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      name: initialData?.name ?? '',
      gradeLevel: initialData?.gradeLevel ?? 7,
      homeroomTeacherId: initialData?.homeroomTeacherId ?? UNASSIGNED_HOMEROOM,
      capacity: initialData?.capacity ?? 32,
    })
  }, [form, initialData, open])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      academicYearId,
      name: values.name,
      gradeLevel: values.gradeLevel,
      homeroomTeacherId:
        values.homeroomTeacherId === UNASSIGNED_HOMEROOM
          ? null
          : values.homeroomTeacherId,
      capacity: values.capacity,
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Tambah Kelas' : 'Edit Kelas'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Buat kelas baru untuk tahun pelajaran yang sedang dipilih.'
              : 'Perbarui identitas kelas tanpa mengubah tahun pelajarannya.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <FormLabel>Tahun Pelajaran</FormLabel>
                <Input value={academicYearName} disabled />
              </div>

              <FormField
                control={form.control}
                name='gradeLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tingkat Kelas</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih tingkat kelas' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, index) => index + 1).map(
                          (gradeLevel) => (
                            <SelectItem key={gradeLevel} value={String(gradeLevel)}>
                              Kelas {gradeLevel}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder='Contoh: VII-A' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='homeroomTeacherId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wali Kelas</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isTeachersLoading ? 'Memuat guru...' : 'Pilih wali kelas'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_HOMEROOM}>
                          Belum ditentukan
                        </SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type='submit' disabled={isPending || !academicYearId}>
                {isPending && (
                  <Loader2 data-icon='inline-start' className='animate-spin' />
                )}
                {mode === 'add' ? 'Simpan Kelas' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
