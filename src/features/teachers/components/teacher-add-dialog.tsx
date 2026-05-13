import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { BookOpen, CalendarIcon, Loader2, Save, UserCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
    createTeacherSchema,
    teacherEmploymentStatusSchema,
    teacherGenderSchema,
    teacherSubjectSchema,
    updateTeacherSchema,
} from '@/lib/validators/teachers'
import {
    buildTeacherSubjectOptions,
    mapTeacherToEditFormDefaults,
    teacherEmploymentStatusOptions,
    type TeacherEmploymentStatus,
    type TeacherGender,
    type TeacherRecord,
} from '../data/schema'
import { useCreateTeacher, useUpdateTeacher } from '../hooks'
import { useTeacher } from './teacher-provider'

const teacherFormSchema = z.object({
    namaLengkap: createTeacherSchema.shape.namaLengkap,
    nik: createTeacherSchema.shape.nik,
    nip: z.string().trim().max(50, 'NIP maksimal 50 karakter'),
    tempatLahir: z.string().trim().max(100, 'Tempat lahir maksimal 100 karakter'),
    tanggalLahir: z.date().optional(),
    jenisKelamin: teacherGenderSchema,
    statusKepegawaian: teacherEmploymentStatusSchema,
    mataPelajaran: z.array(teacherSubjectSchema).default([]),
    tanggalBergabung: z.date({ required_error: 'Tanggal bergabung wajib diisi' }),
    nomorHp: z.string().trim().max(20, 'Nomor HP maksimal 20 karakter'),
    alamat: z.string().trim().max(1000, 'Alamat maksimal 1000 karakter'),
    photoUrl: z.union([
        z.literal(''),
        z.string().trim().url('URL foto tidak valid'),
    ]),
})

type TeacherFormValues = {
    namaLengkap: string
    nik: string
    nip: string
    tempatLahir: string
    tanggalLahir: Date | undefined
    jenisKelamin: TeacherGender
    statusKepegawaian: TeacherEmploymentStatus
    mataPelajaran: string[]
    tanggalBergabung: Date | undefined
    nomorHp: string
    alamat: string
    photoUrl: string
}

const defaultValues: TeacherFormValues = {
    namaLengkap: '',
    nik: '',
    nip: '',
    tempatLahir: '',
    tanggalLahir: undefined,
    jenisKelamin: 'L',
    statusKepegawaian: 'tetap',
    mataPelajaran: [],
    tanggalBergabung: undefined,
    nomorHp: '',
    alamat: '',
    photoUrl: '',
}

function normalizeNullableString(value: string): string | null {
    const normalized = value.trim()

    return normalized.length > 0 ? normalized : null
}

function mapCurrentRowToFormValues(currentRow: TeacherRecord): TeacherFormValues {
    const defaults = mapTeacherToEditFormDefaults(currentRow)

    return {
        namaLengkap: defaults.namaLengkap,
        nik: defaults.nik,
        nip: defaults.nip,
        tempatLahir: defaults.tempatLahir,
        tanggalLahir: defaults.tanggalLahir,
        jenisKelamin: defaults.jenisKelamin,
        statusKepegawaian: defaults.statusKepegawaian,
        mataPelajaran: defaults.mataPelajaran,
        tanggalBergabung: defaults.tanggalBergabung,
        nomorHp: defaults.nomorHp,
        alamat: defaults.alamat,
        photoUrl: defaults.photoUrl,
    }
}

export function TeacherAddDialog() {
    const { currentRow, open, setCurrentRow, setOpen } = useTeacher()
    const createTeacher = useCreateTeacher()
    const updateTeacher = useUpdateTeacher()
    const isEditing = open === 'edit' && currentRow !== null
    const isDialogOpen = open === 'add' || open === 'edit'
    const isPending = createTeacher.isPending || updateTeacher.isPending
    const tabsKey = isEditing && currentRow ? `edit-${currentRow.id}` : open ?? 'closed'
    const subjectOptions = buildTeacherSubjectOptions(
        isEditing && currentRow ? currentRow.mataPelajaran : []
    )

    const form = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherFormSchema),
        defaultValues,
    })

    useEffect(() => {
        if (!isDialogOpen) {
            return
        }

        if (isEditing && currentRow) {
            form.reset(mapCurrentRowToFormValues(currentRow))
            return
        }

        form.reset(defaultValues)
    }, [currentRow, form, isDialogOpen, isEditing])

    const handleClose = () => {
        if (isPending) {
            return
        }

        setOpen(null)
        setCurrentRow(null)
        form.reset(defaultValues)
    }

    const onSubmit = (values: TeacherFormValues) => {
        if (!values.tanggalBergabung) {
            return
        }

        const rawPayload = {
            namaLengkap: values.namaLengkap.trim(),
            nik: values.nik.trim(),
            nip: normalizeNullableString(values.nip),
            tempatLahir: normalizeNullableString(values.tempatLahir),
            tanggalLahir: values.tanggalLahir
                ? format(values.tanggalLahir, 'yyyy-MM-dd')
                : null,
            jenisKelamin: values.jenisKelamin,
            statusKepegawaian: values.statusKepegawaian,
            mataPelajaran: values.mataPelajaran,
            tanggalBergabung: format(values.tanggalBergabung, 'yyyy-MM-dd'),
            nomorHp: normalizeNullableString(values.nomorHp),
            alamat: normalizeNullableString(values.alamat),
            photoUrl: normalizeNullableString(values.photoUrl),
        }

        if (isEditing && currentRow) {
            const payload = updateTeacherSchema.parse(rawPayload)

            updateTeacher.mutate(
                {
                    id: currentRow.id,
                    ...payload,
                },
                {
                    onSuccess: () => {
                        handleClose()
                    },
                }
            )

            return
        }

        const payload = createTeacherSchema.parse(rawPayload)

        createTeacher.mutate(payload, {
            onSuccess: () => {
                handleClose()
            },
        })
    }

    return (
        <Sheet open={isDialogOpen} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                handleClose()
            }
        }}>
            <SheetContent className='flex h-dvh w-full flex-col gap-0 p-0 sm:max-w-[520px]'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex h-full flex-col'>
                        <SheetHeader className='shrink-0 border-b px-6 py-4 text-start'>
                            <SheetTitle>
                                {isEditing ? 'Edit Data Guru' : 'Tambah Data Guru'}
                            </SheetTitle>
                            <SheetDescription>
                                {isEditing
                                    ? 'Perbarui data guru yang sudah terdaftar pada sistem live.'
                                    : 'Isi formulir berikut untuk menambahkan data guru ke sistem live.'}
                            </SheetDescription>
                        </SheetHeader>

                        <div className='flex-1 overflow-hidden'>
                            <Tabs
                                key={tabsKey}
                                defaultValue='identitas'
                                className='flex h-full flex-col'
                            >
                                <div className='shrink-0 px-6 pt-4'>
                                    <TabsList variant='line' className='h-auto w-full justify-start flex-wrap'>
                                        <TabsTrigger value='identitas' className='gap-1.5 py-2'>
                                            <UserCircle className='h-4 w-4' />
                                            Identitas
                                        </TabsTrigger>
                                        <TabsTrigger value='profesi' className='gap-1.5 py-2'>
                                            <BookOpen className='h-4 w-4' />
                                            Kontak &amp; Profesi
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <ScrollArea className='flex-1 px-6 pb-6 pt-2'>
                                    <TabsContent value='identitas' className='m-0 mt-4 space-y-6'>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <FormField
                                                control={form.control}
                                                name='namaLengkap'
                                                render={({ field }) => (
                                                    <FormItem className='md:col-span-2'>
                                                        <FormLabel>Nama Lengkap *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Nama lengkap sesuai KTP'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='nik'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>NIK *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                inputMode='numeric'
                                                                maxLength={16}
                                                                placeholder='16 digit NIK'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='nip'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>NIP</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Isi jika tersedia'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='jenisKelamin'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Jenis Kelamin *</FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Pilih jenis kelamin' />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value='L'>Laki-laki</SelectItem>
                                                                <SelectItem value='P'>Perempuan</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='tempatLahir'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tempat Lahir</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder='Kabupaten/Kota' {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='tanggalLahir'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tanggal Lahir</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant='outline'
                                                                        className={cn(
                                                                            'w-full justify-start text-left font-normal text-sm',
                                                                            !field.value && 'text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
                                                                        {field.value
                                                                            ? format(field.value, 'd MMM yyyy', { locale: idLocale })
                                                                            : 'Pilih tanggal'}
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    captionLayout='dropdown'
                                                                    fromYear={1950}
                                                                    toYear={new Date().getFullYear()}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='profesi' className='m-0 mt-4 space-y-6'>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <FormField
                                                control={form.control}
                                                name='statusKepegawaian'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status Kepegawaian *</FormLabel>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Pilih status kepegawaian' />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {teacherEmploymentStatusOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
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
                                                name='tanggalBergabung'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tanggal Bergabung *</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant='outline'
                                                                        className={cn(
                                                                            'w-full justify-start text-left font-normal text-sm',
                                                                            !field.value && 'text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
                                                                        {field.value
                                                                            ? format(field.value, 'd MMM yyyy', { locale: idLocale })
                                                                            : 'Pilih tanggal'}
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                <Calendar
                                                                    mode='single'
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    captionLayout='dropdown'
                                                                    fromYear={1950}
                                                                    toYear={new Date().getFullYear()}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='nomorHp'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nomor HP</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder='08xxxxxxxxxx' {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='photoUrl'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>URL Foto</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type='url'
                                                                placeholder='https://contoh.com/foto-guru.jpg'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='alamat'
                                                render={({ field }) => (
                                                    <FormItem className='md:col-span-2'>
                                                        <FormLabel>Alamat</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className='min-h-24 resize-y'
                                                                placeholder='Alamat lengkap guru'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='mataPelajaran'
                                                render={({ field }) => (
                                                    <FormItem className='md:col-span-2'>
                                                        <div className='flex items-center justify-between gap-2'>
                                                            <FormLabel>Mata Pelajaran</FormLabel>
                                                            <span className='text-xs text-muted-foreground'>
                                                                {field.value.length} dipilih
                                                            </span>
                                                        </div>
                                                        <div className='grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3'>
                                                            {subjectOptions.map((subject) => {
                                                                const checked = field.value.includes(subject.value)

                                                                return (
                                                                    <label
                                                                        key={subject.value}
                                                                        className='flex items-start gap-3 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:bg-muted/40'
                                                                    >
                                                                        <Checkbox
                                                                            checked={checked}
                                                                            onCheckedChange={(nextChecked) => {
                                                                                if (nextChecked === true) {
                                                                                    field.onChange(
                                                                                        Array.from(
                                                                                            new Set([
                                                                                                ...field.value,
                                                                                                subject.value,
                                                                                            ])
                                                                                        )
                                                                                    )
                                                                                    return
                                                                                }

                                                                                field.onChange(
                                                                                    field.value.filter(
                                                                                        (value) => value !== subject.value
                                                                                    )
                                                                                )
                                                                            }}
                                                                        />
                                                                        <span className='text-sm leading-none'>
                                                                            {subject.label}
                                                                        </span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </div>

                        <div className='flex shrink-0 items-center justify-between border-t bg-muted/20 px-6 py-4'>
                            <div className='hidden text-xs text-muted-foreground sm:block'>
                                Periksa kembali tanggal dan identitas sebelum menyimpan ke API live.
                            </div>
                            <div className='flex w-full justify-end gap-2 sm:w-auto'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleClose}
                                    disabled={isPending}
                                >
                                    Batal
                                </Button>
                                <Button type='submit' disabled={isPending} className='gap-2'>
                                    {isPending ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <Save className='h-4 w-4' />
                                    )}
                                    {isPending
                                        ? 'Menyimpan...'
                                        : isEditing
                                            ? 'Simpan Perubahan'
                                            : 'Simpan Data'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
