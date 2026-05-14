import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import * as XLSX from 'xlsx'
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    Upload,
    UserX,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    buildTeacherBulkFileName,
    buildTeacherBulkTemplateRows,
    mapTeacherBulkWorksheetRows,
    type TeacherBulkRowInput,
} from '@/lib/teachers-bulk'
import { cn } from '@/lib/utils'
import {
    useDeactivateTeacher,
    useExecuteTeacherImport,
    useExportTeachers,
    usePreviewTeacherImport,
} from '../hooks'
import { type TeacherRecord } from '../data/schema'
import { useTeacher } from './teacher-provider'

const route = getRouteApi('/_authenticated/teachers/')

type TeacherImportPreviewResult = {
    rows: Array<{
        rowNumber: number
        nik: string
        namaLengkap: string
        jenisKelamin: string
        statusKepegawaian: string
        mataPelajaran: string[]
        errors: string[]
        warnings: string[]
        isValid: boolean
    }>
    summary: {
        totalRows: number
        validRows: number
        invalidRows: number
        duplicateRows: number
        conflictRows: number
    }
}

type TeacherImportExecutionResult = {
    importedCount: number
    skippedCount: number
    rows: Array<{
        rowNumber: number
        status: 'imported' | 'not_selected' | 'skipped'
        messages: string[]
    }>
}

type ImportStep = 'template' | 'upload' | 'review' | 'done'

function closeTeacherDialog(
    setOpen: (value: 'add' | 'edit' | 'import' | 'export' | 'deactivate' | null) => void,
    setCurrentRow: Dispatch<SetStateAction<TeacherRecord | null>>
) {
    setOpen(null)
    setCurrentRow(null)
}

function downloadBlob(content: BlobPart, fileName: string, contentType: string) {
    const url = URL.createObjectURL(new Blob([content], { type: contentType }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
}

function downloadBase64File(base64: string, fileName: string, contentType: string) {
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
    downloadBlob(bytes, fileName, contentType)
}

function getImportStepBadgeClass(currentStep: ImportStep, step: ImportStep): string {
    return cn(
        'border-muted-foreground/20 text-muted-foreground',
        currentStep === step && 'border-primary/40 bg-primary/10 text-primary',
        currentStep === 'review' && (step === 'template' || step === 'upload') && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        currentStep === 'done' && step !== 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        currentStep === 'done' && step === 'done' && 'border-primary/40 bg-primary/10 text-primary'
    )
}

export function TeacherDeactivateDialog() {
    const { currentRow, open, setCurrentRow, setOpen } = useTeacher()
    const deactivateTeacher = useDeactivateTeacher()

    const handleClose = () => {
        if (deactivateTeacher.isPending) {
            return
        }

        closeTeacherDialog(setOpen, setCurrentRow)
    }

    const handleDeactivate = () => {
        if (!currentRow) {
            return
        }

        deactivateTeacher.mutate(
            { id: currentRow.id },
            {
                onSuccess: () => {
                    closeTeacherDialog(setOpen, setCurrentRow)
                },
            }
        )
    }

    return (
        <Dialog open={open === 'deactivate'} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                handleClose()
            }
        }}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <UserX className='h-5 w-5 text-destructive' />
                        Nonaktifkan Guru
                    </DialogTitle>
                    <DialogDescription>
                        Guru yang dinonaktifkan tidak akan tampil di daftar utama kecuali filter guru nonaktif diaktifkan.
                    </DialogDescription>
                </DialogHeader>
                <div className='rounded-md border border-destructive/20 bg-destructive/5 p-4'>
                    <p className='text-sm text-foreground'>
                        Anda akan menonaktifkan <strong>{currentRow?.namaLengkap ?? 'guru ini'}</strong>.
                    </p>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Tindakan ini tidak menghapus data, tetapi mengubah status guru menjadi nonaktif.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleClose}
                        disabled={deactivateTeacher.isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={handleDeactivate}
                        disabled={!currentRow || deactivateTeacher.isPending}
                    >
                        {deactivateTeacher.isPending && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Nonaktifkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TeacherImportDialog() {
    const { open, setCurrentRow, setOpen } = useTeacher()
    const previewTeacherImport = usePreviewTeacherImport()
    const executeTeacherImport = useExecuteTeacherImport()

    const [currentStep, setCurrentStep] = useState<ImportStep>('template')
    const [sourceRows, setSourceRows] = useState<TeacherBulkRowInput[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<TeacherImportPreviewResult | null>(null)
    const [executionResult, setExecutionResult] = useState<TeacherImportExecutionResult | null>(null)
    const [selectedRowNumbers, setSelectedRowNumbers] = useState<number[]>([])

    const validRowNumbers = useMemo(
        () => previewData?.rows.filter((row) => row.isValid).map((row) => row.rowNumber) ?? [],
        [previewData]
    )

    const selectedRowNumberSet = useMemo(
        () => new Set(selectedRowNumbers),
        [selectedRowNumbers]
    )

    const resetState = () => {
        setCurrentStep('template')
        setSourceRows([])
        setSelectedFile(null)
        setPreviewData(null)
        setExecutionResult(null)
        setSelectedRowNumbers([])
    }

    const handleClose = () => {
        if (previewTeacherImport.isPending || executeTeacherImport.isPending) {
            return
        }

        resetState()
        closeTeacherDialog(setOpen, setCurrentRow)
    }

    const handleDownloadTemplate = () => {
        const workbook = XLSX.utils.book_new()
        const templateSheet = XLSX.utils.aoa_to_sheet(buildTeacherBulkTemplateRows())
        const notesSheet = XLSX.utils.aoa_to_sheet([
            ['Panduan Import Guru'],
            ['1. Gunakan header pada sheet template tanpa diubah.'],
            ['2. Isi tanggal dengan format YYYY-MM-DD.'],
            ['3. Kolom mata pelajaran dapat diisi lebih dari satu dengan pemisah koma.'],
            ['4. Unduh ulang template bila ragu.'],
        ])

        XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template Guru')
        XLSX.utils.book_append_sheet(workbook, notesSheet, 'Panduan')

        const workbookBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

        downloadBlob(
            workbookBuffer,
            buildTeacherBulkFileName('template-import-guru'),
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        setCurrentStep('upload')
    }

    const handlePreviewImport = async () => {
        if (!selectedFile) {
            toast.error('Pilih file Excel terlebih dahulu.')
            return
        }

        const workbook = XLSX.read(await selectedFile.arrayBuffer(), {
            type: 'array',
            cellDates: true,
        })
        const firstSheetName = workbook.SheetNames[0]

        if (!firstSheetName) {
            toast.error('File Excel tidak memiliki sheet yang bisa dibaca.')
            return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const worksheetRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            raw: false,
            dateNF: 'yyyy-mm-dd',
        }) as unknown[][]
        const rows = mapTeacherBulkWorksheetRows(worksheetRows)

        if (rows.length === 0) {
            toast.error('Tidak ada baris data guru yang ditemukan di file tersebut.')
            return
        }

        const result = await previewTeacherImport.mutateAsync({ rows }) as TeacherImportPreviewResult

        setSourceRows(rows)
        setPreviewData(result)
        setExecutionResult(null)
        setSelectedRowNumbers(result.rows.filter((row) => row.isValid).map((row) => row.rowNumber))
        setCurrentStep('review')
    }

    const handleToggleAllValidRows = (checked: boolean) => {
        setSelectedRowNumbers(checked ? validRowNumbers : [])
    }

    const handleToggleRow = (rowNumber: number, checked: boolean) => {
        setSelectedRowNumbers((current) => {
            if (checked) {
                return current.includes(rowNumber) ? current : [...current, rowNumber].sort((left, right) => left - right)
            }

            return current.filter((value) => value !== rowNumber)
        })
    }

    const handleExecuteImport = async () => {
        if (sourceRows.length === 0 || selectedRowNumbers.length === 0) {
            toast.error('Pilih minimal satu baris valid untuk diimpor.')
            return
        }

        const result = await executeTeacherImport.mutateAsync({
            rows: sourceRows,
            selectedRowNumbers,
        }) as TeacherImportExecutionResult

        setExecutionResult(result)
        setCurrentStep('done')
    }

    return (
        <Dialog open={open === 'import'} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                handleClose()
            }
        }}>
            <DialogContent className='max-h-[90vh] sm:max-w-5xl'>
                <DialogHeader>
                    <DialogTitle>Import Data Guru</DialogTitle>
                    <DialogDescription>
                        Ikuti alur 4 langkah: unduh template, unggah file Excel, review validasi per baris, lalu impor baris yang valid.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-wrap gap-2'>
                    {[
                        ['template', '1. Template'],
                        ['upload', '2. Upload'],
                        ['review', '3. Review'],
                        ['done', '4. Selesai'],
                    ].map(([step, label]) => (
                        <Badge key={step} variant='outline' className={getImportStepBadgeClass(currentStep, step as ImportStep)}>
                            {label}
                        </Badge>
                    ))}
                </div>

                <div className='space-y-4 py-2'>
                    {(currentStep === 'template' || currentStep === 'upload') && (
                        <Alert>
                            <FileSpreadsheet className='h-4 w-4' />
                            <AlertTitle>Gunakan template resmi import guru</AlertTitle>
                            <AlertDescription>
                                Template sudah menyesuaikan kolom yang dibutuhkan API live. Tanggal wajib menggunakan format YYYY-MM-DD, dan mata pelajaran bisa dipisahkan dengan koma.
                            </AlertDescription>
                        </Alert>
                    )}

                    {currentStep === 'template' && (
                        <div className='rounded-lg border p-4'>
                            <div className='space-y-2'>
                                <h3 className='font-medium'>Langkah 1 — Unduh template</h3>
                                <p className='text-sm text-muted-foreground'>
                                    Mulai dari template ini supaya header kolom, format tanggal, dan urutan field tetap sesuai dengan validasi server.
                                </p>
                            </div>
                        </div>
                    )}

                    {(currentStep === 'upload' || currentStep === 'review' || currentStep === 'done') && (
                        <div className='grid gap-2 rounded-lg border p-4'>
                            <Label htmlFor='teacher-import-file'>Langkah 2 — Upload file Excel</Label>
                            <Input
                                id='teacher-import-file'
                                type='file'
                                accept='.xlsx,.xls'
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null
                                    setSelectedFile(file)
                                    setPreviewData(null)
                                    setExecutionResult(null)
                                    setSelectedRowNumbers([])
                                    setSourceRows([])

                                    if (file) {
                                        setCurrentStep('upload')
                                    }
                                }}
                                disabled={previewTeacherImport.isPending || executeTeacherImport.isPending}
                            />
                            <p className='text-xs text-muted-foreground'>
                                File yang dipilih: <span className='font-medium text-foreground'>{selectedFile?.name ?? 'belum ada file'}</span>
                            </p>
                        </div>
                    )}

                    {previewData && currentStep !== 'done' && (
                        <div className='grid gap-3'>
                            <div className='grid gap-3 md:grid-cols-4'>
                                <div className='rounded-lg border p-3'>
                                    <p className='text-xs uppercase text-muted-foreground'>Total baris</p>
                                    <p className='mt-1 text-2xl font-semibold'>{previewData.summary.totalRows}</p>
                                </div>
                                <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                                    <p className='text-xs uppercase text-emerald-700'>Baris valid</p>
                                    <p className='mt-1 text-2xl font-semibold text-emerald-800'>{previewData.summary.validRows}</p>
                                </div>
                                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                                    <p className='text-xs uppercase text-amber-700'>Baris tidak valid</p>
                                    <p className='mt-1 text-2xl font-semibold text-amber-800'>{previewData.summary.invalidRows}</p>
                                </div>
                                <div className='rounded-lg border p-3'>
                                    <p className='text-xs uppercase text-muted-foreground'>Konflik / duplikat</p>
                                    <p className='mt-1 text-2xl font-semibold'>
                                        {previewData.summary.conflictRows + previewData.summary.duplicateRows}
                                    </p>
                                </div>
                            </div>

                            <div className='flex flex-wrap items-center justify-between gap-3'>
                                <div>
                                    <h3 className='font-medium'>Langkah 3 — Review hasil validasi</h3>
                                    <p className='text-sm text-muted-foreground'>
                                        Pilih baris valid yang ingin diimpor. Baris dengan error otomatis tidak bisa dipilih.
                                    </p>
                                </div>
                                <div className='flex items-center gap-2 rounded-lg border px-3 py-2 text-sm'>
                                    <Checkbox
                                        checked={validRowNumbers.length > 0 && selectedRowNumbers.length === validRowNumbers.length}
                                        onCheckedChange={(checked) => handleToggleAllValidRows(Boolean(checked))}
                                    />
                                    <span>Pilih semua baris valid ({selectedRowNumbers.length})</span>
                                </div>
                            </div>

                            <ScrollArea className='h-[320px] rounded-lg border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-14'>Pilih</TableHead>
                                            <TableHead>Baris</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>NIK</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead>Validasi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.rows.map((row) => {
                                            const isChecked = selectedRowNumberSet.has(row.rowNumber)

                                            return (
                                                <TableRow key={row.rowNumber}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            disabled={!row.isValid}
                                                            onCheckedChange={(checked) => handleToggleRow(row.rowNumber, Boolean(checked))}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.rowNumber}</TableCell>
                                                    <TableCell>
                                                        <div className='min-w-44'>
                                                            <p className='font-medium'>{row.namaLengkap || '-'}</p>
                                                            <p className='text-xs text-muted-foreground'>
                                                                {row.jenisKelamin || '-'} • {row.statusKepegawaian || '-'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{row.nik || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={row.isValid ? 'secondary' : 'destructive'}>
                                                            {row.isValid ? 'Valid' : 'Perlu revisi'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className='max-w-56 whitespace-normal'>
                                                        {row.mataPelajaran.length > 0 ? row.mataPelajaran.join(', ') : '-'}
                                                    </TableCell>
                                                    <TableCell className='max-w-96 whitespace-normal'>
                                                        <div className='space-y-1'>
                                                            {row.errors.map((error) => (
                                                                <p key={`${row.rowNumber}-${error}`} className='text-xs text-destructive'>• {error}</p>
                                                            ))}
                                                            {row.warnings.map((warning) => (
                                                                <p key={`${row.rowNumber}-${warning}`} className='text-xs text-amber-700'>• {warning}</p>
                                                            ))}
                                                            {row.errors.length === 0 && row.warnings.length === 0 && (
                                                                <p className='text-xs text-emerald-700'>• Baris siap diimpor</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    )}

                    {executionResult && currentStep === 'done' && (
                        <div className='space-y-4'>
                            <Alert>
                                <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                                <AlertTitle>Langkah 4 — Import selesai</AlertTitle>
                                <AlertDescription>
                                    {executionResult.importedCount} guru berhasil ditambahkan. {executionResult.skippedCount} baris tidak diproses karena tidak dipilih atau masih memiliki error.
                                </AlertDescription>
                            </Alert>

                            <div className='rounded-lg border p-4'>
                                <div className='grid gap-2'>
                                    {executionResult.rows.map((row) => (
                                        <div key={row.rowNumber} className='flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between'>
                                            <div>
                                                <p className='font-medium'>Baris {row.rowNumber}</p>
                                                <div className='space-y-1'>
                                                    {row.messages.map((message) => (
                                                        <p key={`${row.rowNumber}-${message}`} className='text-xs text-muted-foreground'>
                                                            • {message}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <Badge variant={row.status === 'imported' ? 'secondary' : 'outline'}>
                                                {row.status === 'imported'
                                                    ? 'Diimpor'
                                                    : row.status === 'not_selected'
                                                        ? 'Tidak dipilih'
                                                        : 'Dilewati'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className='gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleClose}
                        disabled={previewTeacherImport.isPending || executeTeacherImport.isPending}
                    >
                        {currentStep === 'done' ? 'Selesai' : 'Tutup'}
                    </Button>

                    {currentStep === 'template' && (
                        <Button type='button' className='gap-1.5' onClick={handleDownloadTemplate}>
                            <Download className='h-4 w-4' /> Unduh Template
                        </Button>
                    )}

                    {currentStep === 'upload' && (
                        <Button
                            type='button'
                            className='gap-1.5'
                            onClick={() => void handlePreviewImport()}
                            disabled={!selectedFile || previewTeacherImport.isPending}
                        >
                            {previewTeacherImport.isPending ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Upload className='h-4 w-4' />
                            )}
                            Validasi File
                        </Button>
                    )}

                    {currentStep === 'review' && (
                        <>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setCurrentStep('upload')}
                                disabled={executeTeacherImport.isPending}
                            >
                                Ganti File
                            </Button>
                            <Button
                                type='button'
                                className='gap-1.5'
                                onClick={() => void handleExecuteImport()}
                                disabled={selectedRowNumbers.length === 0 || executeTeacherImport.isPending}
                            >
                                {executeTeacherImport.isPending && (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                )}
                                Impor {selectedRowNumbers.length} Baris Valid
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TeacherExportDialog() {
    const { open, setCurrentRow, setOpen } = useTeacher()
    const search = route.useSearch()
    const exportTeachers = useExportTeachers()

    const activeFilterBadges = [
        search.search ? `Cari: ${search.search}` : null,
        search.statusKepegawaian.length > 0 ? `Status: ${search.statusKepegawaian.join(', ')}` : null,
        search.mataPelajaran.length > 0 ? `Mapel: ${search.mataPelajaran.join(', ')}` : null,
        search.includeInactive ? 'Sertakan guru nonaktif' : null,
    ].filter((value): value is string => Boolean(value))

    const handleClose = () => {
        if (exportTeachers.isPending) {
            return
        }

        closeTeacherDialog(setOpen, setCurrentRow)
    }

    const handleExport = async () => {
        const result = await exportTeachers.mutateAsync({
            search: search.search,
            statusKepegawaian: search.statusKepegawaian,
            mataPelajaran: search.mataPelajaran,
            includeInactive: search.includeInactive,
        })

        downloadBase64File(result.base64, result.fileName, result.contentType)
        toast.success(`Export selesai. ${result.rowCount} data guru berhasil disiapkan.`)
        handleClose()
    }

    return (
        <Dialog open={open === 'export'} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                handleClose()
            }
        }}>
            <DialogContent className='sm:max-w-xl'>
                <DialogHeader>
                    <DialogTitle>Eksport Data Guru</DialogTitle>
                    <DialogDescription>
                        Export mengikuti filter daftar guru yang sedang aktif agar file yang dihasilkan sesuai kebutuhan operasional.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-2'>
                    <Alert>
                        <Download className='h-4 w-4' />
                        <AlertTitle>File export akan dibuat dalam format Excel (.xlsx)</AlertTitle>
                        <AlertDescription>
                            Kolom export mencakup identitas guru, status kepegawaian, mata pelajaran, tanggal bergabung, URL foto, dan status aktif.
                        </AlertDescription>
                    </Alert>

                    <div className='rounded-lg border p-4'>
                        <h3 className='font-medium'>Filter yang sedang diterapkan</h3>
                        {activeFilterBadges.length > 0 ? (
                            <div className='mt-3 flex flex-wrap gap-2'>
                                {activeFilterBadges.map((badge) => (
                                    <Badge key={badge} variant='outline'>
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className='mt-2 text-sm text-muted-foreground'>Tidak ada filter khusus. Semua guru aktif pada unit ini akan dieksport.</p>
                        )}
                    </div>

                    {search.includeInactive && (
                        <Alert>
                            <AlertTriangle className='h-4 w-4 text-amber-600' />
                            <AlertTitle>Export akan menyertakan guru nonaktif</AlertTitle>
                            <AlertDescription>
                                Pastikan filter ini memang dibutuhkan agar file tidak mencampur data operasional aktif dan arsip nonaktif.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleClose}
                        disabled={exportTeachers.isPending}
                    >
                        Tutup
                    </Button>
                    <Button
                        type='button'
                        className='gap-1.5'
                        onClick={() => void handleExport()}
                        disabled={exportTeachers.isPending}
                    >
                        {exportTeachers.isPending ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                            <Download className='h-4 w-4' />
                        )}
                        Download Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
