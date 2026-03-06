import { useState } from 'react'
import { UserCircle, MapPin, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDateShort } from '@/lib/format'
import { type Student } from '../data/schema'
import { EditButton, EditDialog, type EditField } from './edit-dialog'

const genderFullLabel: Record<'L' | 'P', string> = {
    L: 'Laki-laki',
    P: 'Perempuan',
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='font-medium'>{value || '-'}</p>
        </div>
    )
}

interface TabDataPribadiProps {
    siswa: Student
}

export function TabDataPribadi({ siswa }: TabDataPribadiProps) {
    const [editOpen, setEditOpen] = useState(false)

    const editFields: EditField[] = [
        { key: 'nis', label: 'NIS', value: siswa.nis, readOnly: true },
        { key: 'nisn', label: 'NISN', value: siswa.nisn, readOnly: true },
        { key: 'nikSiswa', label: 'NIK Siswa', value: siswa.nikSiswa },
        { key: 'nomorKK', label: 'Nomor KK', value: siswa.nomorKK },
        { key: 'namaLengkap', label: 'Nama Lengkap', value: siswa.namaLengkap },
        {
            key: 'jenisKelamin',
            label: 'Jenis Kelamin',
            value: siswa.jenisKelamin,
            type: 'select',
            options: [
                { label: 'Laki-laki', value: 'L' },
                { label: 'Perempuan', value: 'P' },
            ],
        },
        { key: 'tempatLahir', label: 'Tempat Lahir', value: siswa.tempatLahir },
        {
            key: 'tanggalLahir',
            label: 'Tanggal Lahir',
            value: siswa.tanggalLahir.toISOString().split('T')[0],
            type: 'date',
        },
        { key: 'alamat', label: 'Alamat', value: siswa.alamat },
        { key: 'rt', label: 'RT', value: siswa.rt },
        { key: 'rw', label: 'RW', value: siswa.rw },
        { key: 'kelurahan', label: 'Kelurahan', value: siswa.kelurahan },
        { key: 'kecamatan', label: 'Kecamatan', value: siswa.kecamatan },
        { key: 'kabKota', label: 'Kab/Kota', value: siswa.kabKota },
        { key: 'provinsi', label: 'Provinsi', value: siswa.provinsi },
        { key: 'kodePos', label: 'Kode Pos', value: siswa.kodePos },
        { key: 'nomorHp', label: 'Nomor HP', value: siswa.nomorHp, type: 'tel' },
    ]

    return (
        <>
            <div className='mb-4 flex items-center justify-end'>
                <EditButton onClick={() => setEditOpen(true)} />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                {/* Identitas */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <UserCircle className='h-4 w-4' /> Identitas Siswa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <Field label='NIS' value={<span className='font-mono'>{siswa.nis}</span>} />
                            <Field label='NISN' value={<span className='font-mono'>{siswa.nisn}</span>} />
                            <Field label='NIK Siswa' value={<span className='font-mono'>{siswa.nikSiswa}</span>} />
                            <Field label='Nomor KK' value={<span className='font-mono'>{siswa.nomorKK}</span>} />
                        </div>
                        <Separator />
                        <div className='grid grid-cols-2 gap-4'>
                            <Field label='Nama Lengkap' value={siswa.namaLengkap} />
                            <Field label='Jenis Kelamin' value={genderFullLabel[siswa.jenisKelamin]} />
                            <Field label='Tempat Lahir' value={siswa.tempatLahir} />
                            <Field label='Tanggal Lahir' value={formatDateShort(siswa.tanggalLahir)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Alamat */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <MapPin className='h-4 w-4' /> Alamat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-xs text-muted-foreground'>Alamat Lengkap</p>
                            <p className='flex items-start gap-1.5 font-medium'>
                                <MapPin className='mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                                {siswa.alamat}
                            </p>
                        </div>
                        <Separator />
                        <div className='grid grid-cols-2 gap-4'>
                            <Field label='RT' value={siswa.rt} />
                            <Field label='RW' value={siswa.rw} />
                            <Field label='Kelurahan' value={siswa.kelurahan} />
                            <Field label='Kecamatan' value={siswa.kecamatan} />
                            <Field label='Kab/Kota' value={siswa.kabKota} />
                            <Field label='Provinsi' value={siswa.provinsi} />
                            <Field label='Kode Pos' value={<span className='font-mono'>{siswa.kodePos}</span>} />
                        </div>
                    </CardContent>
                </Card>

                {/* Kontak */}
                <Card className='md:col-span-2'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                            <Phone className='h-4 w-4' /> Kontak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                            <Field
                                label='Nomor HP Siswa'
                                value={
                                    <span className='flex items-center gap-1.5'>
                                        <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                                        {siswa.nomorHp}
                                    </span>
                                }
                            />
                            <Field
                                label='Telepon Wali'
                                value={
                                    <span className='flex items-center gap-1.5'>
                                        <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                                        {siswa.teleponWali}
                                    </span>
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditDialog
                title='Edit Data Pribadi'
                description='Perbarui data pribadi siswa. Klik simpan untuk menyimpan perubahan.'
                fields={editFields}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}
