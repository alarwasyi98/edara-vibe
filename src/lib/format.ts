/**
 * Format angka ke format Rupiah Indonesia.
 * @example formatRupiah(350000) → "Rp 350.000"
 * @example formatRupiah(1500000) → "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format angka ke format singkat Rupiah.
 * @example formatRupiahShort(1500000) → "Rp 1,5jt"
 * @example formatRupiahShort(350000) → "Rp 350rb"
 */
export function formatRupiahShort(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.0', '')}M`
    }
    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')}jt`
    }
    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(0)}rb`
    }
    return `Rp ${amount}`
}

/**
 * Format tanggal ke format Indonesia.
 * @example formatDate(new Date('2026-07-05')) → "5 Juli 2026"
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d)
}

/**
 * Format tanggal ke format singkat Indonesia.
 * @example formatDateShort(new Date('2026-07-05')) → "5 Jul 2026"
 */
export function formatDateShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(d)
}

/**
 * Format tanggal dan waktu ke format Indonesia.
 * @example formatDateTime(new Date()) → "5 Juli 2026, 14:30"
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

/**
 * Format bulan tagihan SPP.
 * @example formatBulanTagihan("2026-07") → "Juli 2026"
 */
export function formatBulanTagihan(monthStr: string): string {
    const [year, month] = monthStr.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
    }).format(date)
}

/**
 * Format nomor telepon Indonesia.
 * @example formatPhone("081234567890") → "0812-3456-7890"
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length <= 4) return cleaned
    if (cleaned.length <= 8)
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
}

/**
 * Format angka biasa dengan separator ribuan.
 * @example formatNumber(12345) → "12.345"
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num)
}
