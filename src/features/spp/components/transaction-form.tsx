import * as React from 'react'
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
import { DateInputPicker } from '@/components/date-input-picker'

type TransactionData = {
    id: string
    namaSiswa: string
    posTagihan: string
    nominalTagihan: number
    dibayar: number
    metodeBayar: string
    tanggalBayar: string | null
    keterangan?: string
}

interface TransactionFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data?: TransactionData
    onSave: (id: string, newDibayar: number, newMetode: string, newTanggal: string, newKet?: string) => void
}

export function TransactionForm({ open, onOpenChange, data, onSave }: TransactionFormProps) {
    const today = new Date().toISOString().split('T')[0]

    const [dibayar, setDibayar] = React.useState<string>(data?.dibayar.toString() || '0')
    const [metode, setMetode] = React.useState<string>(data?.metodeBayar || 'tunai')
    const [tanggal, setTanggal] = React.useState<string | null>(data?.tanggalBayar || today)
    const [keterangan, setKeterangan] = React.useState<string>(data?.keterangan || '')

    React.useEffect(() => {
        if (data) {
            setDibayar(data.dibayar.toString())
            setMetode(data.metodeBayar || 'tunai')
            setTanggal(data.tanggalBayar || today)
            setKeterangan(data.keterangan || '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    if (!data) return null

    const handleSave = () => {
        onSave(data.id, Number(dibayar), metode, tanggal ?? today, keterangan)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Edit Transaksi SPP</DialogTitle>
                    <DialogDescription>
                        Perbarui rincian pembayaran untuk <strong>{data.namaSiswa}</strong>. Status tagihan akan dihitung otomatis.
                    </DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right text-muted-foreground text-xs'>Pos Tagihan</Label>
                        <div className='col-span-3 text-sm font-medium'>{data.posTagihan}</div>
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right text-muted-foreground text-xs'>Tagihan</Label>
                        <div className='col-span-3 text-sm'>
                            Rp {data.nominalTagihan.toLocaleString('id-ID')}
                        </div>
                    </div>

                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='dibayar' className='text-right'>Dibayar</Label>
                        <Input
                            id='dibayar'
                            type='number'
                            value={dibayar}
                            onChange={(e) => setDibayar(e.target.value)}
                            className='col-span-3'
                        />
                    </div>

                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Tanggal</Label>
                        <div className='col-span-3'>
                            <DateInputPicker
                                value={tanggal}
                                onChange={setTanggal}
                                className='w-full'
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='metode' className='text-right'>Metode</Label>
                        <Select value={metode} onValueChange={setMetode}>
                            <SelectTrigger className='col-span-3'>
                                <SelectValue placeholder='Pilih Metode' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='tunai'>Tunai</SelectItem>
                                <SelectItem value='transfer'>Transfer</SelectItem>
                                <SelectItem value='qris'>QRIS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='keterangan' className='text-right'>Ket.</Label>
                        <Input
                            id='keterangan'
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder='Opsional...'
                            className='col-span-3'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan Perubahan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
