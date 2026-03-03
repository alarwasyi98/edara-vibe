import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type TahunAjaranItem = {
    id: string
    nama: string
    mulai: string
    selesai: string
    semester: string
    status: 'active' | 'completed' | 'upcoming'
    keterangan?: string
}

type TahunAjaranDialogMode = 'add' | 'edit'

interface TahunAjaranDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: TahunAjaranDialogMode
    initialData?: TahunAjaranItem
    onSave: (data: Omit<TahunAjaranItem, 'id'>) => void
}

export function TahunAjaranDialog({
    open,
    onOpenChange,
    mode,
    initialData,
    onSave,
}: TahunAjaranDialogProps) {
    const [nama, setNama] = useState(initialData?.nama ?? '')
    const [mulai, setMulai] = useState(initialData?.mulai ?? '')
    const [selesai, setSelesai] = useState(initialData?.selesai ?? '')
    const [status, setStatus] = useState<TahunAjaranItem['status']>(
        initialData?.status ?? 'upcoming'
    )
    const [keterangan, setKeterangan] = useState(initialData?.keterangan ?? '')

    React.useEffect(() => {
        if (open) {
            setNama(initialData?.nama ?? '')
            setMulai(initialData?.mulai ?? '')
            setSelesai(initialData?.selesai ?? '')
            setStatus(initialData?.status ?? 'upcoming')
            setKeterangan(initialData?.keterangan ?? '')
        }
    }, [open, initialData])

    const handleSave = () => {
        if (!nama.trim() || !mulai.trim() || !selesai.trim()) {
            toast.error('Lengkapi nama, tanggal mulai, dan tanggal selesai.')
            return
        }
        onSave({
            nama: nama.trim(),
            mulai: mulai.trim(),
            selesai: selesai.trim(),
            semester: status === 'active' ? 'Genap (Jan–Jun)' : 'Belum ditentukan',
            status,
            keterangan: keterangan.trim() || undefined,
        })
        onOpenChange(false)
        toast.success(
            mode === 'add'
                ? `Tahun ajaran ${nama} berhasil ditambahkan. (Demo)`
                : `Tahun ajaran ${nama} berhasil diperbarui. (Demo)`
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'add' ? 'Tambah Tahun Ajaran' : 'Edit Tahun Ajaran'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'add'
                            ? 'Daftarkan tahun ajaran baru.'
                            : 'Perbarui informasi tahun ajaran yang dipilih.'}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-2'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='ta-nama'>Nama Tahun Ajaran</Label>
                        <Input
                            id='ta-nama'
                            placeholder='cth. 2026/2027'
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-1.5'>
                            <Label htmlFor='ta-mulai'>Tanggal Mulai</Label>
                            <Input
                                id='ta-mulai'
                                placeholder='cth. 14 Juli 2026'
                                value={mulai}
                                onChange={(e) => setMulai(e.target.value)}
                            />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor='ta-selesai'>Tanggal Selesai</Label>
                            <Input
                                id='ta-selesai'
                                placeholder='cth. 20 Juni 2027'
                                value={selesai}
                                onChange={(e) => setSelesai(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onValueChange={(v) =>
                                setStatus(v as TahunAjaranItem['status'])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='active'>Aktif</SelectItem>
                                <SelectItem value='upcoming'>Mendatang</SelectItem>
                                <SelectItem value='completed'>Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='ta-keterangan'>Keterangan (opsional)</Label>
                        <Input
                            id='ta-keterangan'
                            placeholder='cth. Sedang berjalan'
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSave}>
                        {mode === 'add' ? 'Tambah' : 'Simpan Perubahan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
