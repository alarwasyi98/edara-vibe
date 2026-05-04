import { and, eq, gte, lte, sql, count, sum, desc, asc } from 'drizzle-orm'
import { authorized } from '../authorized'
import { enrollments } from '@/server/db/schema/enrollments'
import { academicYears } from '@/server/db/schema/academic-years'
import { teachers } from '@/server/db/schema/teachers'
import { cashflowTransactions } from '@/server/db/schema/cashflow'
import { schoolEvents } from '@/server/db/schema/events'
import { activityLogs } from '@/server/db/schema/logs'
import { paymentTransactions } from '@/server/db/schema/spp'
import { Decimal, toDecimal, toDbNumeric } from '@/lib/decimal-setup'
import { cashflowChartSchema } from '@/lib/validators/dashboard'

// ── getSummaryCards ──────────────────────────────────────────

export const getSummaryCards = authorized.handler(async ({ context }) => {
  const unitId = context.unitId!
  const schoolId = context.schoolId

  const activeAcademicYear = await context.tx.query.academicYears.findFirst({
    where: and(
      eq(academicYears.unitId, unitId),
      eq(academicYears.isActive, true),
    ),
  })

  let totalActiveStudents = 0
  if (activeAcademicYear) {
    const [studentResult] = await context.tx
      .select({ count: count() })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.unitId, unitId),
          eq(enrollments.academicYearId, activeAcademicYear.id),
          eq(enrollments.status, 'active'),
        ),
      )
    totalActiveStudents = studentResult?.count ?? 0
  }

  const [teacherResult] = await context.tx
    .select({ count: count() })
    .from(teachers)
    .where(
      and(
        eq(teachers.unitId, unitId),
        eq(teachers.schoolId, schoolId),
        eq(teachers.isActive, true),
      ),
    )
  const totalActiveTeachers = teacherResult?.count ?? 0

  const now = new Date()
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = now.getMonth() + 2 > 12
    ? `${now.getFullYear() + 1}-01-01`
    : `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`

  const [sppThisMonth] = await context.tx
    .select({ total: sum(paymentTransactions.amount) })
    .from(paymentTransactions)
    .where(
      and(
        eq(paymentTransactions.schoolId, schoolId),
        eq(paymentTransactions.transactionType, 'payment'),
        gte(paymentTransactions.paymentDate, currentMonthStart),
        lte(paymentTransactions.paymentDate, nextMonth),
      ),
    )

  const prevMonthStart = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12-01`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`

  const [sppPrevMonth] = await context.tx
    .select({ total: sum(paymentTransactions.amount) })
    .from(paymentTransactions)
    .where(
      and(
        eq(paymentTransactions.schoolId, schoolId),
        eq(paymentTransactions.transactionType, 'payment'),
        gte(paymentTransactions.paymentDate, prevMonthStart),
        lte(paymentTransactions.paymentDate, currentMonthStart),
      ),
    )

  const sppIncomeThisMonth = toDecimal(sppThisMonth?.total)
  const sppIncomePrevMonth = toDecimal(sppPrevMonth?.total)

  let deltaPercent: string | null = null
  if (!sppIncomePrevMonth.isZero()) {
    const delta = sppIncomeThisMonth
      .minus(sppIncomePrevMonth)
      .div(sppIncomePrevMonth)
      .times(100)
    deltaPercent = toDbNumeric(delta)
  }

  return {
    totalActiveStudents,
    totalActiveTeachers,
    sppIncomeThisMonth: toDbNumeric(sppIncomeThisMonth),
    sppIncomeDeltaPercent: deltaPercent,
  }
})

// ── getCashflowChart ────────────────────────────────────────

export const getCashflowChart = authorized
  .input(cashflowChartSchema)
  .handler(async ({ input, context }) => {
    const unitId = context.unitId!
    const { months } = input

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
    const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`

    const rows = await context.tx
      .select({
        month: sql<string>`to_char(${cashflowTransactions.transactionDate}::date, 'YYYY-MM')`,
        type: cashflowTransactions.type,
        total: sum(cashflowTransactions.amount),
      })
      .from(cashflowTransactions)
      .where(
        and(
          eq(cashflowTransactions.unitId, unitId),
          gte(cashflowTransactions.transactionDate, startDateStr),
        ),
      )
      .groupBy(
        sql`to_char(${cashflowTransactions.transactionDate}::date, 'YYYY-MM')`,
        cashflowTransactions.type,
      )
      .orderBy(
        asc(sql`to_char(${cashflowTransactions.transactionDate}::date, 'YYYY-MM')`),
      )

    const monthMap = new Map<string, { income: Decimal; expense: Decimal }>()

    for (const row of rows) {
      if (!monthMap.has(row.month)) {
        monthMap.set(row.month, {
          income: new Decimal(0),
          expense: new Decimal(0),
        })
      }
      const entry = monthMap.get(row.month)!
      if (row.type === 'income') {
        entry.income = toDecimal(row.total)
      } else {
        entry.expense = toDecimal(row.total)
      }
    }

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      income: toDbNumeric(data.income),
      expense: toDbNumeric(data.expense),
    }))
  })

// ── getUpcomingEvents ───────────────────────────────────────

export const getUpcomingEvents = authorized.handler(async ({ context }) => {
  const unitId = context.unitId!
  const today = new Date().toISOString().split('T')[0]!

  return await context.tx
    .select({
      id: schoolEvents.id,
      name: schoolEvents.name,
      category: schoolEvents.category,
      startDate: schoolEvents.startDate,
      endDate: schoolEvents.endDate,
      location: schoolEvents.location,
      status: schoolEvents.status,
    })
    .from(schoolEvents)
    .where(
      and(
        eq(schoolEvents.unitId, unitId),
        gte(schoolEvents.startDate, today),
        eq(schoolEvents.status, 'scheduled'),
      ),
    )
    .orderBy(asc(schoolEvents.startDate))
    .limit(5)
})

// ── getRecentActivity ───────────────────────────────────────

export const getRecentActivity = authorized.handler(async ({ context }) => {
  const unitId = context.unitId!

  return await context.tx
    .select({
      id: activityLogs.id,
      actorName: activityLogs.actorName,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      description: activityLogs.description,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(eq(activityLogs.unitId, unitId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(10)
})
