import * as z from 'zod'

// ── Cashflow Chart ───────────────────────────────────────────

export const cashflowChartSchema = z.object({
  months: z.number().int().min(1).max(12).default(6),
})

export type CashflowChartInput = z.infer<typeof cashflowChartSchema>

// ── Activity Logs ────────────────────────────────────────────

export const activityLogListSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export type ActivityLogListInput = z.infer<typeof activityLogListSchema>
