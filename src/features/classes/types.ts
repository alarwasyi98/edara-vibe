export type DateValue = string | Date

export interface AcademicYearOption {
  id: string
  name: string
  startDate: DateValue
  endDate: DateValue
  isActive: boolean
}

export interface TeacherOption {
  id: string
  label: string
}

export interface ClassSummary {
  id: string
  schoolId: string
  unitId: string
  academicYearId: string
  name: string
  gradeLevel: number
  homeroomTeacherId: string | null
  homeroomTeacherName: string | null
  capacity: number
  activeStudentCount: number
  remainingCapacity: number
  createdAt: DateValue
}

export interface ClassGradeGroup {
  gradeLevel: number
  totalClasses: number
  totalStudents: number
  classes: ClassSummary[]
}

export interface ClassListResult {
  academicYear: AcademicYearOption | null
  totalClasses: number
  grades: ClassGradeGroup[]
}

export interface ClassStudent {
  enrollmentId: string
  studentId: string
  nis: string | null
  nisn: string | null
  namaLengkap: string
  namaWali: string | null
  nomorHpWali: string | null
  status: string
  enrolledAt: DateValue
}

export interface ClassDetail {
  id: string
  schoolId: string
  unitId: string
  academicYearId: string
  academicYearName: string
  academicYearIsActive: boolean
  name: string
  gradeLevel: number
  homeroomTeacherId: string | null
  homeroomTeacherName: string | null
  capacity: number
  createdAt: DateValue
  activeStudentCount: number
  remainingCapacity: number
  students: ClassStudent[]
}
