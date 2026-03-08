import { type SppStatus } from '@/lib/constants'

export type DiskonType = 'persentase' | 'nominal'

export interface DiskonItem {
    id: string
    nama: string
    tipe: DiskonType
    nilai: number
}

/**
 * Menghitung total nominal tagihan setelah dipotong diskon.
 * Diskon dijumlahkan (additive) namun tidak bisa melebihi 100% atau membuat tagihan minus.
 * @param nominalStandar Nominal awal tagihan.
 * @param diskons Array diskon yang dimiliki oleh siswa untuk tagihan ini.
 * @returns { nominalTagihan, totalNominalDiskon }
 */
export function calculateNominalTagihan(
    nominalStandar: number,
    diskons: DiskonItem[] = []
): { nominalTagihan: number; totalNominalDiskon: number } {
    let totalNominalDiskon = 0

    // Hitung total nilai diskon dari array diskon yang aktif
    diskons.forEach((diskon) => {
        if (diskon.tipe === 'persentase') {
            // contoh: 10% dari nominal
            totalNominalDiskon += nominalStandar * (diskon.nilai / 100)
        } else if (diskon.tipe === 'nominal') {
            // contoh: potong Rp 50.000
            totalNominalDiskon += diskon.nilai
        }
    })

    // Pastikan diskon tidak melebihi nominal awal (paling mentok bayar 0)
    if (totalNominalDiskon > nominalStandar) {
        totalNominalDiskon = nominalStandar
    }

    const nominalTagihan = nominalStandar - totalNominalDiskon

    return {
        nominalTagihan: Math.max(0, nominalTagihan),
        totalNominalDiskon,
    }
}

/**
 * Menentukan status SPP berdasarkan jumlah yang dibayar, total tagihan yang wajib, dan jatuh tempo.
 * @param totalDibayar Total seluruh uang yang sudah ditransfer/masuk untuk tagihan ini
 * @param nominalTagihan Tagihan wajib setelah diskon
 * @param tanggalJatuhTempo Tanggal jatuh tempo (opsional, string YYYY-MM-DD)
 * @returns Status SPP: 'unpaid', 'partial', 'paid', atau 'overdue'
 */
export function determineSppStatus(
    totalDibayar: number,
    nominalTagihan: number,
    tanggalJatuhTempo?: string | null
): SppStatus {
    if (totalDibayar >= nominalTagihan && nominalTagihan > 0) {
        return 'paid'
    } else if (totalDibayar > 0 && totalDibayar < nominalTagihan) {
        return 'partial'
    } else if (totalDibayar === 0) {
        // Cek apakah sudah jatuh tempo
        if (tanggalJatuhTempo) {
            const today = new Date().toISOString().split('T')[0]
            if (today > tanggalJatuhTempo) {
                return 'overdue'
            }
        }
        return 'unpaid'
    }

    // Default fallback
    return 'unpaid'
}
