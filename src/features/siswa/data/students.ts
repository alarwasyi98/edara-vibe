import { faker } from '@faker-js/faker'

faker.seed(12345)

const kota = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Yogyakarta',
    'Semarang',
    'Malang',
    'Bogor',
    'Bekasi',
    'Depok',
    'Tangerang',
]

const kelasList = [
    'VII-A',
    'VII-B',
    'VII-C',
    'VIII-A',
    'VIII-B',
    'VIII-C',
    'IX-A',
    'IX-B',
    'IX-C',
]

const firstNamesL = [
    'Ahmad',
    'Muhammad',
    'Rizki',
    'Fauzan',
    'Hasan',
    'Ridwan',
    'Zaki',
    'Dani',
    'Arif',
    'Galih',
    'Ilham',
    'Fajar',
    'Rafi',
    'Bayu',
    'Irfan',
]

const firstNamesP = [
    'Siti',
    'Nisa',
    'Aisyah',
    'Fatimah',
    'Zahra',
    'Putri',
    'Dewi',
    'Annisa',
    'Rahma',
    'Layla',
    'Khadijah',
    'Amira',
    'Nabila',
    'Salma',
    'Hafsa',
]

const lastNames = [
    'Hidayat',
    'Pratama',
    'Nugroho',
    'Ramadhani',
    'Permana',
    'Saputra',
    'Utami',
    'Lestari',
    'Anggraini',
    'Santoso',
    'Wibowo',
    'Kurniawan',
    'Maulana',
    'Firdaus',
    'Hakim',
]

export const students = Array.from({ length: 120 }, (_, i) => {
    const gender = faker.helpers.arrayElement(['L', 'P'] as const)
    const firstName = faker.helpers.arrayElement(
        gender === 'L' ? firstNamesL : firstNamesP
    )
    const lastName = faker.helpers.arrayElement(lastNames)
    const tahunMasuk = faker.helpers.arrayElement(['2023', '2024', '2025'])

    return {
        id: faker.string.uuid(),
        nis: `${tahunMasuk}${String(i + 1).padStart(4, '0')}`,
        nisn: faker.string.numeric(10),
        namaLengkap: `${firstName} ${lastName}`,
        jenisKelamin: gender,
        tempatLahir: faker.helpers.arrayElement(kota),
        tanggalLahir: faker.date.birthdate({ min: 11, max: 15, mode: 'age' }),
        kelas: faker.helpers.arrayElement(kelasList),
        tahunMasuk,
        status: faker.helpers.weightedArrayElement([
            { weight: 8, value: 'active' as const },
            { weight: 1, value: 'graduated' as const },
            { weight: 0.5, value: 'transferred' as const },
            { weight: 0.5, value: 'inactive' as const },
        ]),
        namaWali: `${faker.helpers.arrayElement(firstNamesL)} ${faker.helpers.arrayElement(lastNames)}`,
        teleponWali: `08${faker.string.numeric(10)}`,
        alamat: `Jl. ${faker.location.street()} No. ${faker.number.int({ min: 1, max: 200 })}, ${faker.helpers.arrayElement(kota)}`,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    }
})
