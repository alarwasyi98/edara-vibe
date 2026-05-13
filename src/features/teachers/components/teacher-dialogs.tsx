import { type Dispatch, type SetStateAction } from 'react'
import { AlertTriangle, Download, Loader2, Upload, UserX } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { type TeacherRecord } from '../data/schema'
import { useDeactivateTeacher } from '../hooks'
import { useTeacher } from './teacher-provider'

function closeTeacherDialog(
    setOpen: (value: 'add' | 'edit' | 'import' | 'export' | 'deactivate' | null) => void,
    setCurrentRow: Dispatch<SetStateAction<TeacherRecord | null>>
) {
    setOpen(null)
    setCurrentRow(null)
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

    return (
        <Dialog open={open === 'import'} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                closeTeacherDialog(setOpen, setCurrentRow)
            }
        }}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Import Data Guru</DialogTitle>
                    <DialogDescription>
                        Fitur import guru live belum tersedia pada Step 21.
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-2'>
                    <div className='rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30'>
                        <div className='flex items-start gap-3'>
                            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                            <div className='space-y-1 text-sm text-amber-900 dark:text-amber-200'>
                                <p className='font-medium'>Import massal belum diaktifkan.</p>
                                <p>
                                    Untuk sementara, penambahan data guru live dilakukan lewat formulir tambah/edit per guru.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => closeTeacherDialog(setOpen, setCurrentRow)}
                    >
                        Tutup
                    </Button>
                    <Button type='button' disabled className='gap-1.5'>
                        <Upload className='h-4 w-4' /> Belum Tersedia
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TeacherExportDialog() {
    const { open, setCurrentRow, setOpen } = useTeacher()

    return (
        <Dialog open={open === 'export'} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                closeTeacherDialog(setOpen, setCurrentRow)
            }
        }}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Eksport Data Guru</DialogTitle>
                    <DialogDescription>
                        Fitur export guru live belum tersedia pada Step 21.
                    </DialogDescription>
                </DialogHeader>
                <div className='rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30'>
                    <div className='flex items-start gap-2'>
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
                        <p className='text-sm text-amber-800 dark:text-amber-300'>
                            Export massal belum dihubungkan ke API live. Gunakan tampilan daftar dan detail guru untuk peninjauan data saat ini.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => closeTeacherDialog(setOpen, setCurrentRow)}
                    >
                        Tutup
                    </Button>
                    <Button type='button' disabled className='gap-1.5'>
                        <Download className='h-4 w-4' /> Belum Tersedia
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
