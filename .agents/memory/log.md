# Session Log — EDARA

> Layer 3: Episodic memory — what happened, when, and what changed.
> Append new sessions at the top. Never delete old entries.

## Current State Summary (as of Session 28)

| Property | Value |
|----------|-------|
| Branch | Do not trust this file for live branch state; verify with `git status` / `git log` |
| SHA | Verify current SHA from git before acting on branch-sensitive work |
| Last PR | #21 (feat: wire academic years frontend to live API) |
| CI | Teacher Step 22 code gates pass locally (`format:check`, `test:run`, `typecheck`, `rtk lint --max-warnings 10`, `build`) |
| Deployment | https://edara.vercel.app/ (working, login functional) |
| Next Step | **Advance to Section 9 Step 23 — Class API Router** |

### Current Implementation Snapshot

**What's Done:**
- Sections 1–8 are complete through Step 22
- Live today: auth runtime, tenant/school-unit flows, academic years, dashboard, activity logs, and full Teacher Management including list/detail/create/update/deactivate plus bulk import preview/partial import and filtered Excel export
- Section 9 onward still remains to be migrated from mock-backed frontend and/or missing domain routers: classes, students, SPP, cashflow, and events

**Next Actions:**
1. Treat `docs/implementation-plan.md`, `AGENTS.md`, `.agents/memory/project.md`, and this log as the AI-facing source of truth for feature status
2. Verify branch/SHA directly from git before doing branch-sensitive work
3. Start Section 9 Step 23 (Class API Router) and preserve the current teacher import/export behavior unless requirements change

---

## Session 28 — 2026-05-15: Section 8 Step 22 — Teacher Bulk Import & Export

**Scope:** Implement the next migration milestone after Teacher Step 21 by turning Teacher bulk import/export from placeholders into live tenant API workflows, then re-run the repo code gates and align the AI-facing docs/memory.

### What Happened
Built Step 22 around the existing flat `tenant.teachers` router shape instead of introducing a new jobs subsystem. The final flow parses uploaded Excel workbooks in the browser with `xlsx`, sends parsed rows to the server for authoritative preview validation and partial import, and generates filtered teacher exports on the server with `exceljs` as a JSON-safe base64 workbook payload for browser download.

On the server, `src/server/routers/teachers/index.ts` now exposes `previewImport`, `executeImport`, and `export` alongside the existing CRUD procedures. Validation reuses `createTeacherSchema`, detects duplicate `nik` values inside the upload batch and against existing teachers in the same `schoolId + unitId`, surfaces row-level errors and warnings, and only inserts valid selected rows during the execute step while preserving activity-log coverage on the bulk import mutation.

On the client, `src/features/teachers/components/teacher-dialogs.tsx` was rewritten from placeholders into the live 4-step import flow described in the feature stories: download template, upload workbook, preview/validate, and confirm import. The export dialog now reads the active teacher filters from route search state and downloads a filtered workbook, while `src/features/teachers/components/teacher-action-buttons.tsx` now advertises live import/export actions instead of “Belum Tersedia”.

A shared helper layer was added in `src/lib/teachers-bulk.ts` with tests in `src/lib/__tests__/teachers-bulk.test.ts`, plus new teacher import/export hooks and validator schemas. One bug surfaced during verification: worksheet row numbering initially collapsed after blank rows were skipped, so `mapTeacherBulkWorksheetRows` was corrected to preserve original Excel row numbers in validation feedback.

### Verification
- `pnpm install` succeeded after adding `exceljs` and `xlsx`
- `lsp_diagnostics` was clean on all changed teacher bulk files
- `pnpm format:check` passed
- `pnpm test:run` passed (`4` test files, `19` tests)
- `pnpm typecheck` passed
- `rtk lint --max-warnings 10` passed with the same 10 pre-existing warnings in unrelated files
- `pnpm build` passed; the known chunk-size warning still appears but does not fail the build

### Resulting State
- Section 8 is now complete through Step 22
- Teacher Management now covers TCH-01 through TCH-05 in the live app
- Next planned migration work is Section 9 Step 23 — Class API Router

---

## Session 27 — 2026-05-13: Section 8 Step 21 — Teacher Frontend Wired to Live API

**Scope:** Audit Step 20, complete Step 21 against the real teacher feature cluster, verify the live migration, and align AI memory with the resulting codebase state.

### What Happened
Confirmed Step 20 backend work was already complete, then rewired Teacher Management frontend from mock data to the live `tenant.teachers.*` API in the current repo structure. The list page now uses live paginated/filterable teacher data, the detail page uses `getById`, and create/update/deactivate flows use real mutations with invalidation and Indonesian toast handling. Teacher import/export was intentionally not implemented in Step 21; those actions now stay visible only as explicitly unavailable placeholders so the UI does not imply a live bulk workflow.

An Oracle review was used before finalizing. Its follow-up fixes tightened the migration by reusing shared validator exports from `src/lib/validators/teachers.ts`, preserving unknown live `mataPelajaran` values in edit mode, generating subject filter options from live data, disabling deactivate for already-inactive teachers, disabling misleading local sorting on the live table, and moving the add/edit form shell to the requested side-sheet pattern.

### Files Updated

| File | Change |
|------|--------|
| `src/features/teachers/data/schema.ts` | Added live teacher contracts, shared route-search schema/defaults, normalization helpers, status derivation, edit-form mapping, and dynamic subject-option builder while retaining legacy mock schema exports for compatibility |
| `src/features/teachers/data/schema.test.ts` | Added regression tests for route defaults, subject normalization, active/inactive derivation, edit-form defaults, and custom live subject preservation |
| `src/routes/_authenticated/teachers/index.tsx` | Switched route search validation to the shared teacher route-search schema |
| `src/features/teachers/hooks/use-teachers.ts` | Added live teacher list query hook |
| `src/features/teachers/hooks/use-teacher-by-id.ts` | Added live teacher detail query hook |
| `src/features/teachers/hooks/use-create-teacher.ts` | Added live create mutation hook with toasts and list invalidation |
| `src/features/teachers/hooks/use-update-teacher.ts` | Added live update mutation hook with list/detail invalidation |
| `src/features/teachers/hooks/use-deactivate-teacher.ts` | Added live deactivate mutation hook with list/detail invalidation |
| `src/features/teachers/hooks/teacher-query-cache.ts` | Centralized teacher list/detail invalidation helpers |
| `src/features/teachers/hooks/index.ts` | Added barrel exports for teacher hooks |
| `src/features/teachers/index.tsx` | Replaced mock teacher source with live list query and mounted live dialog set |
| `src/features/teachers/detail.tsx` | Replaced mock detail lookup with live `useTeacherById` flow and real-field rendering |
| `src/features/teachers/components/teacher-table.tsx` | Rewired to live server-side pagination/filter state, inactive toggle, live totals, inactive row styling, and dynamic subject filter options |
| `src/features/teachers/components/teacher-columns.tsx` | Replaced mock-only columns with live teacher fields and disabled misleading local sorting |
| `src/features/teachers/components/teacher-provider.tsx` | Updated provider state to use live `TeacherRecord` rows and `deactivate` dialog state |
| `src/features/teachers/components/teacher-row-actions.tsx` | Rewired actions to live teacher rows, renamed destructive action to deactivate, and disabled it for already-inactive teachers |
| `src/features/teachers/components/teacher-action-buttons.tsx` | Kept add live while marking import/export as unavailable placeholders |
| `src/features/teachers/components/teacher-dialogs.tsx` | Added live deactivate confirmation dialog and converted import/export dialogs into explicit unavailable placeholders |
| `src/features/teachers/components/teacher-add-dialog.tsx` | Rewrote add/edit flow to RHF + Zod live form, shared validators, side-sheet UI, live subject preservation, and real create/update mutations |
| `src/lib/validators/teachers.ts` | Exported reusable teacher enum/value schemas for frontend validator reuse |
| `.agents/memory/project.md` | Updated project memory to reflect Step 21 completion |
| `.agents/memory/log.md` | Recorded this session and advanced the top-level state summary |

### Verification
- `lsp_diagnostics` on `src/features/teachers` → clean
- `pnpm test:run` → pass (3 files, 16 tests)
- `pnpm typecheck` → pass
- `pnpm lint` → pass with 10 existing warnings, no new errors
- `pnpm build` → app compiled and bundled, but prerender failed because the local workspace has no `DATABASE_URL` / runtime DB env for Neon

### Resulting State
- Step 20 backend audit verdict: complete
- Step 21 frontend wiring verdict: complete for list/detail/create/update/deactivate
- Teacher import/export remains intentionally deferred and visibly unavailable
- Remaining migrations still center on classes, students, SPP, cashflow, and events

---

## Session 26 — 2026-05-12: Section 8 Step 20 — Teacher API

**Scope:** Implement the first live Teacher Management backend slice and keep AI memory aligned with the new status.

### What Happened
Added the tenant-scoped teacher API under `tenant.teachers`, created shared teacher validators, and registered CRUD-style procedures for `list`, `getById`, `create`, `update`, and `deactivate`. The implementation follows the current oRPC/Drizzle backend patterns, keeps teacher records scoped by `schoolId` + `unitId`, supports `ilike` search plus employment-status/subject filters, and uses soft-delete via `isActive = false`.

### Files Updated

| File | Change |
|------|--------|
| `src/lib/validators/teachers.ts` | Added teacher list/create/update Zod schemas for the live API contract |
| `src/server/routers/teachers/index.ts` | Added tenant-scoped teacher procedures with pagination, filtering, soft-delete, and activity-log middleware |
| `src/server/routers/app-router.ts` | Registered `tenant.teachers` endpoints |
| `AGENTS.md` | Updated current status to reflect Step 20 complete and Step 21 next |
| `.agents/memory/project.md` | Updated feature inventory and milestone status for Teacher Management |
| `.agents/memory/log.md` | Recorded this session and advanced the top-level state summary |

### Verification
- `pnpm format:check`
- `pnpm typecheck`
- `rtk lint --max-warnings 10`
- `pnpm build`

All commands passed. Lint remains at the existing baseline of 10 warnings; no new errors were introduced.

---

## Session 25 — 2026-05-12: AI Memory Alignment Pass

**Scope:** Documentation-only update. No product code changed.

### What Happened
Corrected stale AI-facing memory so future agents no longer treat the repo as pre-auth, pre-oRPC, or fully mock-backed. Aligned `AGENTS.md`, `.agents/memory/project.md`, and the top summary of this log with the verified codebase state.

### Files Updated

| File | Change |
|------|--------|
| `AGENTS.md` | Updated Current Status to show Sections 1–7 complete through Step 19 and Section 8 as next |
| `.agents/memory/project.md` | Rewrote stale progress, feature inventory, gotchas, and auth migration notes to match live code reality |
| `.agents/memory/log.md` | Updated top-level summary to stop presenting stale branch workflow as current source of truth |

### Verified State Captured
- Live: auth runtime, tenant/unit flows, academic years, dashboard, activity logs
- Still pending/live-migration work: teachers, classes, students, SPP, cashflow, events
- Branch/SHA state should be read from git, not inferred from AI memory files

---

## Session 24 — 2026-05-04: Steps 18–19 Complete — Dashboard & Activity Log (Section 7)

**Branch:** `feat/dashboard` (from `dev`, 2 commits ahead)
**Commits:** `d865ad7` (Step 18), `98efc7f` (Step 19)
**Final SHA:** `98efc7f`

### What Happened
Completed Section 7: Dashboard & Activity Log. Implemented both backend API routers (Step 18) and frontend UI (Step 19). All dashboard data now fetched from live API with loading states and empty states.

### Step 18: Dashboard API Router

#### Files Created

| File | Purpose |
|------|---------|
| `src/lib/validators/dashboard.ts` | Zod schemas: `cashflowChartSchema` (months param), `activityLogListSchema` (pagination) |
| `src/server/routers/dashboard/index.ts` | 4 procedures: `getSummaryCards`, `getCashflowChart`, `getUpcomingEvents`, `getRecentActivity` |
| `src/server/routers/activity-logs/index.ts` | 1 procedure: `listActivityLogs` (paginated, grouped by day) |

#### Files Modified

| File | Change |
|------|--------|
| `src/server/routers/app-router.ts` | Registered `tenant.dashboard.{getSummaryCards, getCashflowChart, getUpcomingEvents, getRecentActivity}` and `tenant.activityLogs.{list}` |

#### API Design Details

**Dashboard Router (`tenant.dashboard`):**
- **`getSummaryCards`** — returns: `totalActiveStudents` (enrollments with status='active' in active academic year), `totalActiveTeachers` (teachers with isActive=true), `sppIncomeThisMonth` (SUM of payment_transactions with type='payment' for current month), `sppIncomeDeltaPercent` (percentage change vs previous month, computed with decimal.js)
- **`getCashflowChart`** — input: `months` (default 6), returns: array of `{ month: 'YYYY-MM', income: string, expense: string }` aggregated from cashflow_transactions, grouped by month and type
- **`getUpcomingEvents`** — returns: next 5 events where `startDate >= NOW()` and status='scheduled', ordered by startDate ASC
- **`getRecentActivity`** — returns: last 10 activity_logs for the unit, ordered by createdAt DESC

**Activity Logs Router (`tenant.activityLogs`):**
- **`listActivityLogs`** — input: pagination params, returns: paginated result with logs grouped by day (SQL `date(created_at)` as grouping key), each group contains array of log entries

### Step 19: Dashboard Frontend

#### Files Created

| File | Purpose |
|------|---------|
| `src/features/dashboard/hooks/use-summary-cards.ts` | `useQuery(orpc.tenant.dashboard.getSummaryCards.queryOptions({}))` |
| `src/features/dashboard/hooks/use-cashflow-chart.ts` | `useQuery(orpc.tenant.dashboard.getCashflowChart.queryOptions({ months }))` |
| `src/features/dashboard/hooks/use-upcoming-events.ts` | `useQuery(orpc.tenant.dashboard.getUpcomingEvents.queryOptions({}))` |
| `src/features/dashboard/hooks/use-recent-activity.ts` | `useQuery(orpc.tenant.dashboard.getRecentActivity.queryOptions({}))` |
| `src/features/dashboard/hooks/index.ts` | Barrel export for all dashboard hooks |

#### Files Modified

| File | Change |
|------|--------|
| `src/features/dashboard/index.tsx` | Wired to real hooks, replaced mock data, added loading skeletons and empty states |
| `src/features/dashboard/components/overview.tsx` | Rewritten to use `useCashflowChart()`, changed from AreaChart to BarChart, added loading/empty states |
| `src/lib/format.ts` | Added `relative` format option to `formatDate()` for activity log timestamps |

#### Key Implementation Details

**Dashboard Layout:**
- Row 1: 3 Summary Cards (Total Siswa Aktif, Total Guru Aktif, Penerimaan SPP Bulan Ini with delta badge)
- Row 2: Left 60% = Cashflow BarChart (income/expense), Right 40% = Recent Payments (kept as placeholder)
- Row 3: Left 50% = Activity Log (last 10 entries with relative timestamps), Right 50% = Upcoming Events (next 5 events)

**Loading States:**
- Summary cards: 3 skeleton cards with spinner
- Activity log: centered spinner
- Upcoming events: centered spinner
- Cashflow chart: centered spinner

**Empty States:**
- Activity log: "Belum ada aktivitas"
- Upcoming events: "Tidak ada kegiatan mendatang"
- Cashflow chart: "Belum ada data arus kas"

**Relative Time Formatting:**
- `formatDate(date, 'relative')` returns: "baru saja", "X menit lalu", "X jam lalu", "X hari lalu", "X minggu lalu", "X bulan lalu", "X tahun lalu"

### Verification
- `tsc --noEmit` → 0 errors ✅
- `eslint --max-warnings 10` → 0 errors, 11 warnings (baseline) ✅
- `lsp_diagnostics` on all dashboard files → clean ✅

---

## Session 23 — 2026-05-04: Step 18 Complete — Dashboard & Activity Logs API Routers

**Branch:** `feat/section-7-dashboard` (from `dev`, 1 commit ahead with doc update)
**Commit:** `bf09f6c` (doc update), implementation commits pending
**Final SHA:** (pending — work complete, not yet committed)

### What Happened
Completed Step 18: created `dashboardRouter` and `activityLogsRouter` with all required procedures. All dashboard queries are read-only, scoped by unit context, and use decimal.js for financial calculations.

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/validators/dashboard.ts` | Zod schemas: `cashflowChartSchema` (months param), `activityLogListSchema` (pagination) |
| `src/server/routers/dashboard/index.ts` | 4 procedures: `getSummaryCards`, `getCashflowChart`, `getUpcomingEvents`, `getRecentActivity` |
| `src/server/routers/activity-logs/index.ts` | 1 procedure: `listActivityLogs` (paginated, grouped by day) |

### Files Modified

| File | Change |
|------|--------|
| `src/server/routers/app-router.ts` | Registered `tenant.dashboard.{getSummaryCards, getCashflowChart, getUpcomingEvents, getRecentActivity}` and `tenant.activityLogs.{list}` |

### API Design Details

**Dashboard Router (`tenant.dashboard`):**
- **`getSummaryCards`** — returns: `totalActiveStudents` (enrollments with status='active' in active academic year), `totalActiveTeachers` (teachers with isActive=true), `sppIncomeThisMonth` (SUM of payment_transactions with type='payment' for current month), `sppIncomeDeltaPercent` (percentage change vs previous month, computed with decimal.js)
- **`getCashflowChart`** — input: `months` (default 6), returns: array of `{ month: 'YYYY-MM', income: string, expense: string }` aggregated from cashflow_transactions, grouped by month and type
- **`getUpcomingEvents`** — returns: next 5 events where `startDate >= NOW()` and status='scheduled', ordered by startDate ASC
- **`getRecentActivity`** — returns: last 10 activity_logs for the unit, ordered by createdAt DESC

**Activity Logs Router (`tenant.activityLogs`):**
- **`listActivityLogs`** — input: pagination params, returns: paginated result with logs grouped by day (SQL `date(created_at)` as grouping key), each group contains array of log entries

### Key Implementation Details
- **Active students** — computed from `enrollments` table with status='active' in the active academic year (not from `students.isActive` which doesn't exist)
- **SPP income aggregation** — uses `SUM(payment_transactions.amount)` filtered by `transactionType='payment'` and date range, all amounts handled with decimal.js
- **Delta calculation** — `(current - previous) / previous * 100`, returns `null` if previous month is zero
- **Cashflow chart** — uses `to_char(transaction_date, 'YYYY-MM')` for month grouping, pivots income/expense into separate columns
- **Date handling** — current month start/end computed with JavaScript Date, formatted as `YYYY-MM-DD` strings for SQL comparison
- **Activity log grouping** — SQL `date(created_at)` extracts day, then JavaScript `reduce()` groups by day for client consumption

### Verification
- `tsc --noEmit` → 0 errors ✅
- `lsp_diagnostics` on all new files → clean ✅
- All procedures use `authorized` middleware (read-only, no role gating)
- All queries scoped by `context.unitId` and `context.schoolId`

---

## Session 22 — 2025-07-17: Step 17 Complete — Academic Year Frontend Wired to Live API

**Branch:** `feature/step-17-wire-academic-years-frontend` (from `dev`, merged via PR #21 to main)
**PR:** #21 (dev → main, squash-merged)
**Final SHA:** `d170c5f` (main), `0a4e848` (dev synced via Method B merge)

### What Happened
Completed Step 17: wired the Academic Year frontend page to the live oRPC API. Replaced all mock `useState` data with `useQuery`/`useMutation` hooks. Converted form to react-hook-form + zodResolver. Added shared type definitions and status derivation logic. All CI gates passed. Merged to production via PR #21.

### Files Created/Modified

| File | Change |
|------|--------|
| `src/features/academic-years/types.ts` | NEW — `AcademicYearRecord` interface + `deriveStatus()` function |
| `src/features/academic-years/index.tsx` | REWRITTEN — useQuery for data, useMutation for activate, loading skeletons, AlertDialog confirmation |
| `src/features/academic-years/components/tahun-ajaran-dialog.tsx` | REWRITTEN — react-hook-form + zodResolver, create/update mutations, cache invalidation |
| `src/features/academic-years/components/tahun-ajaran-row-actions.tsx` | UPDATED — removed delete action, kept edit + activate |

### Key Decisions
- **No separate hook files** — mutations/queries inlined in components (simpler for this scope, unlike the plan's suggested separate hook files)
- **`deriveStatus()` utility** — derives UI status from `isActive` + `endDate` comparison (active/completed/upcoming)
- **Removed delete action** — no delete API exists; only edit and activate remain
- **Removed non-DB columns** — semester and keterangan columns removed from table (not in schema)
- **Dates as `yyyy-MM-dd` strings** — submitted to API in ISO date format, displayed with `formatDate()` locale helper
- **Method B sync** — used merge (not reset) because safety net blocked `git reset --hard`; content identical per `git diff --stat`

### Verification
- Prettier: ✅ pass
- TypeScript (`tsc --noEmit`): ✅ zero errors
- ESLint (`--max-warnings 10`): ✅ 0 errors, 2 known warnings
- Vite build: ✅ built successfully
- `git diff --stat main dev`: empty (branches synced)

---

## Session 21 — 2025-07-16: Hotfix — Disable Prerender for CI

**Branch:** `hotfix/disable-prerender` (from `dev`, merged via PR #20 to main)
**PR:** #20 (hotfix/disable-prerender → main, merged)
**Final SHA:** `ae2058a` (main and dev synced)

### What Happened
CI pipeline failed after PR #19 merge because Nitro prerendering attempted to crawl routes during build, which requires a database connection (not available in CI). Created hotfix to disable prerendering entirely since EDARA is an SPA (no SSR/prerender needed).

### Root Cause
- Nitro's default `prerender` config attempted to crawl links and prerender routes during `pnpm build`
- The build step in CI runs without `DATABASE_URL` being accessible to the Nitro prerender crawler
- SPA mode does not benefit from prerendering — all routes are client-rendered

### Files Modified

| File | Change |
|------|--------|
| `vite.config.ts` | Added `nitro: { prerender: { routes: [], crawlLinks: false } }` to disable prerendering |
| `.github/workflows/ci.yml` | Added `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` env vars to build step |
| `.gitignore` | Added `.vercel` directory |
| `eslint.config.js` | Added `.vercel` to eslint ignores |

### Key Decisions
- **Prerendering disabled permanently** — SPA mode means all routes are client-rendered; prerendering adds no value and causes CI failures
- **Env vars in CI** — Build step needs env vars because Nitro evaluates server code during build (even with prerender disabled, it still bundles server modules)
- **Git workflow change** — User explicitly requested: "ASK me first if you want to push and create a PR". Future sessions must ask before pushing.
- **Feature branches stay local** — User explicitly requested: "Do NOT push feature branches. Instead, merge locally to dev first then push as a PR"

### Verification
- CI pipeline passes: format:check ✅, typecheck ✅, lint ✅, build ✅
- Vercel deployment succeeds
- All feature/hotfix branches deleted after merge

---

## Session 20 — 2025-07-15: Steps 15–16 + Vercel Deployment Fix + White Flash Fix

**Branch:** `feature/step-15-tenant-frontend-unit-management` (from `dev`, merged locally to dev)
**PRs:** #18 (dev → main, Step 15), #19 (dev → main, Step 16 + Vercel fix + white flash fix)
**SHA after #19:** `cbd8c46`

### What Happened
Implemented Step 15 (Tenant Frontend — Unit Management & Switcher) and Step 16 (Academic Year API Router). Also fixed Vercel deployment issues and white flash between page navigations.

### Step 15: Tenant Frontend — Unit Management & Switcher

#### Files Created

| File | Purpose |
|------|---------|
| `src/features/settings/hooks/use-school.ts` | `useQuery(orpc.tenant.schools.get.queryOptions({}))` — fetches school with units relation |
| `src/features/settings/hooks/use-units.ts` | Derives units array from `useSchool()` data via `useMemo` |
| `src/features/settings/hooks/use-create-unit.ts` | `useMutation(orpc.tenant.units.create.mutationOptions({...}))` — invalidates `orpc.tenant.schools.key()` |
| `src/features/settings/hooks/use-update-unit.ts` | `useMutation(orpc.tenant.units.update.mutationOptions({...}))` — invalidates `orpc.tenant.schools.key()` |
| `src/features/settings/hooks/index.ts` | Barrel export for all settings hooks |

#### Files Modified

| File | Change |
|------|--------|
| `src/features/settings/components/unit-grid.tsx` | Wired to `useUnits()` hook, replaced mock data |
| `src/features/settings/components/unit-card.tsx` | Updated to use real data types from API |
| `src/features/settings/components/unit-form-drawer.tsx` | Wired to `useCreateUnit()`/`useUpdateUnit()` with RHF + zodResolver(createUnitSchema) |
| `src/stores/tenant-store.ts` | Rewritten to use oRPC data via `useSyncTenant` pattern |
| `src/components/layout/tenant-switcher.tsx` | Wired to real unit list from Zustand store |

#### Key Patterns Established
- **Hook pattern:** `useQuery(orpc.X.queryOptions({}))` for reads, `useMutation(orpc.X.mutationOptions({...}))` for writes
- **Cache invalidation:** Mutations invalidate `orpc.tenant.schools.key()` since units are read from school relation
- **Form pattern:** react-hook-form + `zodResolver(schema)` + shadcn Form components
- **Zustand sync:** `useSyncTenant` populates store from API; tenant-switcher reads from store

### Step 16: Academic Year API Router

#### Files Created

| File | Purpose |
|------|---------|
| `src/server/routers/academic-years/index.ts` | 5 procedures: `listAcademicYears`, `getActiveAcademicYear`, `createAcademicYear`, `updateAcademicYear`, `activateAcademicYear` |
| `src/lib/validators/academic-years.ts` | `createAcademicYearSchema` (name YYYY/YYYY regex, startDate, endDate with refine), `updateAcademicYearSchema` |

#### Files Modified

| File | Change |
|------|--------|
| `src/server/routers/app-router.ts` | Registered `tenant.academicYears.{list, getActive, create, update, activate}` |

#### API Design Details
- **`listAcademicYears`** — uses `authorized` middleware, queries by `context.unitId`, ordered by `startDate DESC`
- **`getActiveAcademicYear`** — returns active year or `null`
- **`createAcademicYear`** — uses `tenantAdmin` (super_admin + kepala_sekolah), validates date overlap via `checkDateOverlap()` helper
- **`updateAcademicYear`** — validates date overlap excluding self, checks `startDate < endDate`
- **`activateAcademicYear`** — B2 exclusive activation: deactivates current active → activates target, all within RLS transaction (`context.tx`)
- **Date overlap validation** — `checkDateOverlap()` uses `lte(startDate, endDate) AND gte(endDate, startDate)` pattern

### Vercel Deployment Fix

| Issue | Fix |
|-------|-----|
| Nitro preset not set | Added `nitro: { preset: 'vercel' }` to vite.config.ts |
| `vercel.json` catch-all rewrite blocking `/api/*` | Deleted `vercel.json` entirely (Nitro handles routing) |
| Better Auth `trustedOrigins` | Added `https://edara.vercel.app` to Better Auth config |

### White Flash Fix

| Issue | Fix |
|-------|-----|
| White flash between page navigations | Added `defaultPendingComponent` (Loader2 spinner), `defaultPendingMs: 200`, `defaultPendingMinMs: 300` to `src/router.tsx` |

### Verification
- `tsc --noEmit` → 0 errors ✅
- `eslint` → 0 errors ✅
- `pnpm build` → passes ✅
- Vercel deployment → https://edara.vercel.app/ working ✅
- Login flow → working end-to-end ✅

---

## Session 19 — 2025-07-15: Step 14 — Tenant & Unit API Routers

**Branch:** `feature/step-14-tenant-unit-routers` (from `dev`, merged and deleted)
**PR:** #15 (feature → dev), #16 (dev → main, merged)
**Final SHA:** `309bfd5` (main and dev synced)

### What Happened
Implemented Section 5, Step 14 of the implementation plan: Tenant & Unit API Routers. Created school and unit CRUD procedures, Zod validators with NPSN validation, and registered the tenant router in the app router.

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/validators/tenant.ts` | Zod schemas: `npsnSchema` (8-digit regex), `updateSchoolSchema`, `createUnitSchema`, `updateUnitSchema` |
| `src/server/routers/tenant/index.ts` | Barrel export for tenant router procedures |
| `src/server/routers/tenant/schools.ts` | `getSchool`, `updateSchool` — uses `authOnly` base (no unit context) |
| `src/server/routers/tenant/units.ts` | `listUnits`, `getUnitById`, `createUnit`, `updateUnit` — uses `authorized` base with RLS |

### Files Modified

| File | Change |
|------|--------|
| `src/server/routers/authorized.ts` | Extracted `authOnly = base.use(authMiddleware)`, refactored `authorized = authOnly.use(requireUnitContextMiddleware)` |
| `src/server/routers/app-router.ts` | Registered `tenant.schools.{get, update}` and `tenant.units.{list, getById, create, update}` |

### Key Decisions
- **`authOnly` middleware layer** — `schools.get/update` don't need RLS/unit context; they resolve the user's school from their assignment via `resolveAssignment()` and use `db` directly (not `context.tx`)
- **Validators in `src/lib/validators/`** — per plan, positioned for future client-side form reuse with react-hook-form + zodResolver
- **Tenant-scoped queries** — all unit operations filter by `context.schoolId` as defense-in-depth alongside PostgreSQL RLS
- **Role gating** — unit mutations restricted to `super_admin` and `kepala_sekolah` via `tenantAdmin = authorized.use(requireRole([...]))`

### Verification
- `tsc --noEmit` → 0 errors
- `eslint` → 0 errors (fixed one duplicate import)
- PR #16 merged dev → main, both branches synced to same SHA

---

## Session 18 — 2025-07-14: Steps 12–13 — oRPC Foundation & Root Router

**Branch:** `feature/step-12-13-orpc-foundation` (from `dev`)
**Commit:** `5a9bac3` (reset, will recommit with log update)

### What Happened
Implemented Section 4 of the implementation plan: oRPC Foundation & Root Router (Steps 12–13). Created the full oRPC server-to-client pipeline and shared API utilities.

### Files Created

| File | Purpose |
|------|---------|
| `src/server/routers/app-router.ts` | Root `appRouter` — plain object composing `admin.users` domain router |
| `src/server/routers/index.ts` | Barrel exporting `appRouter` + `AppRouter` type |
| `src/routes/api/rpc/$.ts` | Catch-all handler wiring oRPC `RPCHandler` to `/api/rpc/*` via `createFileRoute` + `server.handlers` |
| `src/lib/orpc-client.ts` | Typed `RouterClient<AppRouter>` with `RPCLink` + `credentials: 'include'` for cookie auth |
| `src/lib/orpc-react.ts` | `orpc` TanStack Query utils via `createTanstackQueryUtils(client)` |
| `src/server/shared/validators.ts` | Shared Zod v4 validators: `uuidSchema`, `idParam`, `paginationSchema`, `paginationToOffset`, `PaginatedResult<T>`, `paginate()`, `dateRangeSchema`, `searchSchema`, `sortDirectionSchema`, `sortableSchema(columns)` |
| `src/server/shared/errors.ts` | Error helpers (all `: never`): `notFound`, `unauthorized`, `forbidden`, `badRequest`, `conflict`, `internalError` — all throw `ORPCError` |
| `src/server/shared/index.ts` | Barrel re-exporting all shared validators + errors |

### Key Decisions
- **Router as plain object** — oRPC v1 uses plain JS objects with procedures as values (no `createRouter` needed)
- **Shared validators in `src/server/shared/`** — not `src/lib/validators/` as originally planned, to keep server-only code separate
- **Error helpers return `: never`** — enables TypeScript narrowing after throw
- **`RPCHandler` from `@orpc/server/fetch`** — Fetch API compatible handler for Nitro runtime
- **`RouterClient` from `@orpc/server`** — typed client type (not from `@orpc/client`)

### Verification
- `tsc --noEmit` → 0 errors ✅
- `eslint` on all 8 new files → 0 errors ✅

---

## Session 17 — 2026-04-30: Step 9 — Auth API Route (Blockers Log)

**Branch:** `backup/step0-plan-update`
**Commit:** (pending — changes staged, not yet committed)

### What Happened
Implemented Step 9 (Auth API Route Handler) and encountered multiple blockers that required debugging and resolution before the route could function.

### Blockers Encountered

#### Blocker 1: `createAPIFileRoute` Does Not Exist in SPA Mode
- **Problem:** Oracle agent recommended using `createAPIFileRoute('/api/auth/$')` for the auth catch-all handler, which is the documented pattern for TanStack Start API routes. However, this export does not exist in `@tanstack/react-start@1.167.50` when running in SPA mode.
- **Root Cause:** TanStack Start SPA mode (`spa: { enabled: true }`) does not expose `createAPIFileRoute` — it only provides `createFileRoute` with `server.handlers` as the escape hatch for API routes.
- **Resolution:** Used `createFileRoute('/api/auth/$')` with `server.handlers` property instead. This is the pattern used by t3-turbo and Better Auth CLI scaffolding.

#### Blocker 2: `window is not defined` — SSR Module Evaluation
- **Problem:** After creating the auth route, the dev server crashed with `ReferenceError: window is not defined` in `auth-client.ts`.
- **Root Cause:** `auth-client.ts` used `window.location.origin` at module-level scope to set `baseURL`. TanStack Start evaluates ALL route modules on the server side (even in SPA mode) to build the route tree. This means any module imported by a route file gets executed in a Node.js context where `window` does not exist.
- **Resolution:** Added a guard: `typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'` as the `baseURL` fallback.

#### Blocker 3: `matchMedia is not a function` — Theme Provider SSR Crash
- **Problem:** After fixing the window guard, the server crashed again with `TypeError: matchMedia is not a function` in `theme-provider.tsx`.
- **Root Cause:** Same SSR module evaluation issue. `theme-provider.tsx` called `window.matchMedia('(prefers-color-scheme: dark)')` at module level to determine the default theme.
- **Resolution:** Added SSR guard: `typeof window !== 'undefined' && typeof window.matchMedia === 'function'` before calling `matchMedia`.

#### Blocker 4: TanStack Version Mismatch — `router.stores.matches.get()` Crash
- **Problem:** After fixing SSR guards, the main page (`/`) returned HTTP 500 with error: `TypeError: router.stores.matches.get is not a function` at `ssr-server.js:142`.
- **Root Cause:** `package.json` used caret ranges (`^1.x.x`) for TanStack packages, causing `pnpm` to resolve two different versions of `@tanstack/router-core`: v1.168.3 (from `react-router`) and v1.168.17 (from `react-start`). The `ssr-server.js` module expected the `.stores.matches.get()` API from v1.168.15+, but the router instance was created with v1.168.3 which uses a different internal API.
- **Resolution:** Pinned ALL TanStack packages to exact versions (no caret):
  - `@tanstack/react-router`: `1.168.25`
  - `@tanstack/react-start`: `1.167.50`
  - `@tanstack/router-devtools`: `1.166.13`
  - Removed redundant devDeps: `@tanstack/router-plugin`, `@tanstack/start-client-core`, `@tanstack/start-server-core`
  - After `pnpm install`, all packages resolve to single `router-core@1.168.17`

#### Blocker 5: `QueryClientProvider` Duplication
- **Problem:** `__root.tsx` wrapped children in `QueryClientProvider`, but `router.tsx` also wrapped via `Wrap` option — causing React context duplication warnings.
- **Resolution:** Removed `QueryClientProvider` from `__root.tsx`, kept it only in `router.tsx`'s `Wrap` option (single source of truth).

#### Blocker 6: Dev Server Process Management
- **Problem:** After fixing all code issues, could not verify the fix because `curl` returned HTTP 000 (connection refused). Vite reported "ready" but port 3000 was not listening.
- **Root Cause:** The bash tool kills processes after timeout. `pnpm dev` was started with a 20s timeout, Vite reported ready within that window, but the process was killed when the timeout expired. PowerShell `Start-Job` also failed because background jobs run in isolated process spaces that don't bind ports to the host.
- **Resolution:** Used `[System.Diagnostics.Process]::Start()` to spawn a truly detached `cmd.exe /c pnpm dev` process. Vite bound to `[::1]:3000` (IPv6 localhost). Curl needed `http://[::1]:3000/` to connect.

### Files Changed
- `src/routes/api/auth/$.ts` — NEW: Better Auth catch-all handler using `createFileRoute` + `server.handlers`
- `src/lib/auth-client.ts` — SSR guard for `window.location.origin`
- `src/context/theme-provider.tsx` — SSR guard for `window.matchMedia`
- `src/router.tsx` — Added `dehydrate`/`hydrate`/`Wrap` with QueryClientProvider
- `src/routes/__root.tsx` — Removed duplicate QueryClientProvider
- `package.json` — Pinned TanStack versions, removed redundant devDeps
- `pnpm-lock.yaml` — Regenerated with pinned versions
- `src/routeTree.gen.ts` — Regenerated to include `/api/auth/$` route

### Verification
- `/api/auth/ok` → `{"ok":true}` HTTP 200 ✅
- `/` → Full HTML document HTTP 200 (4619 bytes) ✅
- `tsc --noEmit` → 0 errors ✅
- `vite dev` → starts on port 3000 ✅

### Key Takeaway
TanStack Start SPA mode is NOT a pure client-side SPA — it still evaluates route modules on the server to build the route tree and handle API routes via Nitro. Any module-level code that references browser APIs (`window`, `document`, `matchMedia`) will crash the server. All browser API usage must be guarded with `typeof window !== 'undefined'` checks or deferred to `useEffect`/runtime.

---

## Session 16 — 2026-04-29: Step 8 — Better Auth Server Setup

**Branch:** `backup/step0-plan-update`
**Commit:** (pending — all changes staged, not yet committed)

### What Happened
Executed all 6 sub-tasks of Step 8 (Better Auth Server Setup):

| Sub-task | Description | Status |
|----------|-------------|--------|
| 8.1 | Move `src/lib/auth.ts` → `src/server/auth/index.ts` + update imports | ✅ |
| 8.2 | Fix FK: `userSchoolAssignments.userId` varchar(255) → uuid with FK to `user.id` | ✅ |
| 8.3 | Fix migration drift: `clerk_user_id` → `user_id` in SQL, rename index | ✅ |
| 8.4 | Normalize role constants: `admin`→`super_admin`, `tata_usaha`→`admin_tu` | ✅ |
| 8.5 | Setup `.env` / `.env.local`: add `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL`, remove Clerk vars | ✅ |
| 8.6 | Verify: `tsc --noEmit` zero errors, dev server starts on :3000 | ✅ |

### Files Changed
- `src/server/auth/index.ts` — NEW: Better Auth server config (moved from `src/lib/auth.ts`)
- `src/lib/auth.ts` — DELETED (moved to server/auth)
- `src/server/routers/middlewares/auth.ts` — Updated import path
- `src/server/db/schema/users.ts` — `userId` changed from `varchar(255)` to `uuid` with FK to `user.id`, added user relation
- `drizzle/0000_init_tenant_operational_schema.sql` — `clerk_user_id` → `user_id`, index renamed
- `drizzle/0002_next_power_pack.sql` — Added ALTER COLUMN + FK constraint for user_school_assignments
- `src/lib/constants.ts` — ROLES: `ADMIN`→`SUPER_ADMIN`, `TATA_USAHA`→`ADMIN_TU`; labels updated
- `src/config/rbac.ts` — Permission matrix keys: `admin`→`super_admin`, `tata_usaha`→`admin_tu`
- `src/hooks/use-rbac.ts` — Mock role: `'admin'`→`'super_admin'`
- `src/features/users/data/users.ts` — Mock roles aligned with DB enum
- `src/features/users/data/schema.ts` — Zod schema aligned with DB enum
- `src/features/users/data/data.ts` — Role labels/values aligned with DB enum
- `.env` — Cleaned: removed Clerk vars, added Better Auth vars
- `.env.local` — Same cleanup

### Verification
- `tsc --noEmit` → 0 errors ✅
- `vite dev` → localhost:3000 ready in ~4s ✅
- `grep` for old role names → 0 matches ✅

---

## Session 15 — 2026-04-29: Step 0 — TanStack Start SPA Migration

**Branch:** `backup/step0-plan-update`
**Commits:** `c6bb610` (docs) → `2247d7b` (feat)

### What Happened
Identified that the implementation plan was missing a critical prerequisite: migrating from plain Vite SPA to TanStack Start SPA mode. Steps 9 (auth API route) and 12 (oRPC API route) require server-side API routes via Nitro, which only TanStack Start provides.

### Phase 1: Plan Update (`c6bb610`)
- Added **Section 2.5 — Step 0** to `docs/implementation-plan.md` with 9 sub-tasks
- Updated dependency graph: Step 0 → Step 8 → Step 9 → Step 10 → Step 11
- Updated Steps 8, 9, 12 to reference Step 0 as dependency
- Updated Appendix A (PRD traceability), B (dependency graph), C (known issues)
- Total steps: 40 → 41

### Phase 2: Execution (`2247d7b`)
Migrated from `@tanstack/react-router` + plain Vite to `@tanstack/react-start` SPA mode:

| File | Action |
|------|--------|
| `src/client.tsx` | Created — `hydrateRoot(document, <StartClient />)` |
| `src/server.ts` | Created — `createServerEntry` with Nitro handler |
| `src/router.tsx` | Created — `getRouter()` factory + QueryClient context |
| `src/routes/__root.tsx` | Rewritten — full HTML document + `head()` with meta/OG/fonts |
| `vite.config.ts` | Updated — `tanstackStart({ spa: true })` + `nitro()` + `tsconfigPaths` |
| `package.json` | Updated — `@tanstack/react-start` + `nitro` to deps, removed `@rsbuild/core` |
| `index.html` | Deleted — replaced by `__root.tsx` `head()` |
| `src/main.tsx` | Deleted — Start manages entry points |
| `.gitignore` | Updated — added `.output/` |

### Research Findings
- TanStack Query + Table are framework-agnostic (no migration benefit from Start)
- Start adds: server functions, API routes, SSR, Nitro runtime
- SPA mode (`spa: { enabled: true }`) gives server runtime WITHOUT SSR
- oRPC makes `createServerFn` redundant (both provide type-safe RPC)
- `@vitejs/plugin-react-swc` works with Start (despite docs showing non-SWC)

### Verification
- `pnpm install` ✅
- `vite dev` → localhost:3000 ✅
- `tsc --noEmit` → 0 errors ✅

### Decisions
- See ADR-007 in decisions.md

---

## Session 14 — 2026-04-26: Finalisasi SPA Auth & PR ke `dev`

**Branch:** `feat/auth`
**PR:** https://github.com/alarwasyi98/edara/pull/9 (`feat/auth` → `dev`)

### What Happened
Blank page on dev server fixed. Three root causes found and resolved:
1. **Schema duplication in `users.ts`** — `userId` field defined twice, `userIdx` index defined twice, `t.userId` appeared twice in unique index → TypeScript error TS1117 blocked build entirely
2. **Better Auth `baseURL` invalid** — `auth-client.ts` used relative path `'/api/auth'` instead of absolute URL → runtime crash before React rendered
3. **Server deps leaked to client bundle** — `src/routes/api/auth/$.ts` imported `auth` → `db` → `neon()` → TanStack Router bundled server-side code into client

### Fixes Applied
- Removed duplicate properties in `src/server/db/schema/users.ts`
- Changed `baseURL` to `window.location.origin` in `src/lib/auth-client.ts`
- Deleted `src/routes/api/auth/$.ts` (SSR-only pattern incompatible with SPA)
- Updated `src/routeTree.gen.ts` to remove `/api/auth/$` references
- Added try/catch + error check in `getSession()` for graceful `null` return
- Added `.playwright-mcp/` to `.gitignore`

### Decisions
- Removed API auth route entirely (SSR-only, not SPA-compatible)
- `window.location.origin` as baseURL (safe in SPA, per Better Auth docs)
- `getSession()` returns `null` on error (route guard handles redirect)
- Created backup branch `feat/auth-backup-2026-04-26`

### Verification
All CI checks passed: format ✅, typecheck ✅, lint ✅ (8 warnings baseline), build ✅, tests ✅ (11 tests, 2 files). `/sign-in` and `/sign-up` render correctly. Route guard redirects work.

### Better Auth Audit (~40% complete)
- ✅ Auth schema correct (`user`, `session`, `account`, `verification`)
- ✅ Separation of concerns: Better Auth = identity, `user_school_assignments` = tenancy/RBAC
- ✅ Client layer clean and testable
- ✅ oRPC middleware scaffolding correct pattern
- ❌ No server runtime executing `betterAuth()` instance
- ❌ `src/lib/auth.ts` accessible from client (should be `src/server/`)
- ❌ `userSchoolAssignments.userId` missing FK to `user.id`
- ❌ Auth schema missing explicit `hashedPassword` column
- ❌ Admin router missing role checks
- ❌ Drizzle migration drift: snapshot has `user_id`, SQL `0000` still has `clerk_user_id`

---

## Session 13 — 2026-04-25: Better Auth Recovery on `feat/auth`

### What Happened
Recovery of Better Auth migration on `feat/auth` branch. White screen resolved, auth routes made consistent, CI checks passing, preview production bundle accessible.

### Key Fixes
- Removed duplicate `src/routes/auth/*` routes (kept canonical `/sign-in`, `/sign-up`, `/forgot-password`)
- Regenerated `src/routeTree.gen.ts` after route cleanup
- Added route guards: `/_authenticated` redirects to `/sign-in?redirect=...`; public auth pages redirect logged-in users to `/`
- Replaced mock auth (Zustand/cookie) with Better Auth client calls in sign-in/sign-up forms
- Removed `createServerFn` dependency (not compatible with Vite SPA)
- Removed `tanstackStartCookies()` plugin (leaked `@tanstack/start-server-core` to client build)
- Added `.worktrees` ignore for ESLint, Prettier, `.gitignore`
- Generated forward migration `drizzle/0002_next_power_pack.sql` for Better Auth tables

### Root Causes
1. Two auth route systems coexisted (root `(auth)` + new `src/routes/auth/*`)
2. API/import patterns assumed full TanStack Start runtime (not SPA)
3. Local worktree polluted lint results
4. Previous "fix" commits contained mismatched APIs

---

## Session 12 — 2026-04-24: Better Auth Migration Fixes

### What Happened
Build errors from Better Auth migration implementation fixed. 12 of 13 migration tasks completed successfully. Remaining build errors resolved.

### Fixes
- Installed `@tanstack/react-start` package
- Moved `generateId` to `advanced.database.generateId`
- Changed `.inputValidator()` to `.input(z.object(...))`
- Regenerated routeTree for new auth routes
- Added missing `createFileRoute` import
- Fixed TypeScript `any` types with proper Zod schemas

### Migration Tasks Completed (12/13)
Package deps, schema naming (`clerkUserId` → `userId`), Better Auth schema, auth config, auth handler route, session helpers, oRPC middleware, assignment helper, auth pages, Clerk route removal, admin user router, documentation update.

---

## Session 10 — 2026-04-22: Auth Spec Hardening

### What Happened
Auth specification hardened and canonicalized. Better Auth migration spec (`src/docs/better-auth-migration-spec.md`) established as the single source of truth for the Clerk → Better Auth migration.

---

## Sessions 8–9 — 2026-04-20/21: Auth Migration Design

### What Happened
Designed and specified the Clerk → Better Auth migration. Created canonical migration spec with architectural decision, responsibility split, data model strategy, integration design, and 8-phase implementation plan.

---

## Session 7 — 2026-04-19: Rollup Fix

### What Happened
Fixed rollup version conflict. Added `pnpm.overrides.rollup: "4.60.0"` to `package.json`.

---

## Session 6 — 2026-04-18: Naming Convention Refactoring

### What Happened
Refactored naming conventions from Indonesian to English for folders and routes. Sidebar labels kept in Indonesian (Option B convention). Created `naming-dictionary.json` mapping.

---

## Session 5 — 2026-04-17: DB Schema Optimization

### What Happened
Optimized database schema definitions. Refined table structures, indexes, and constraints.

---

## Session 4 — 2026-04-16: CI Remediation

### What Happened
Fixed CI pipeline. Established baseline: format check, typecheck, lint (max 10 warnings), build.

---

## Session 3 — 2026-04-15: Section 2 Execution

### What Happened
Executed Section 2 of implementation plan (Database Schema & RLS). Created 18 tables across 12 schema files. All Drizzle schemas defined.

---

## Session 2 — 2026-04-14: Section 2 Planning

### What Happened
Planned Section 2 implementation. Mapped technical specification schemas to Drizzle ORM definitions.

---

## Session 1 — 2026-04-13: Initial Stabilization

### What Happened
Initial project stabilization. Cleaned up legacy code, established project structure, set up development environment.

---

## Milestone Tracker

> Re-evaluated 2025-07-17 against PRD, ADRs, Memory, Rules, and Feature Stories.
> Source of truth: `docs/implementation-plan.md` (12 sections, 41 steps including Step 0).

### Section 1 — Stabilization & Infrastructure

| Step | Description | Status |
|------|------------|--------|
| 1 | Fix Build & Lint Errors | ✅ Done |
| 2 | Configure Path Aliases & Project Structure | ✅ Done |
| 3 | Stabilize Dev Server & Bundle | ✅ Done |

### Section 2 — Database Schema & RLS

| Step | Description | Status |
|------|------------|--------|
| 4 | Core & Auth Schema | ✅ Done |
| 5 | Operational Schema | ✅ Done |
| 6 | Generate Drizzle Migrations | ✅ Done |
| 7 | RLS Policies & Constraints | ✅ Done |

### Section 2.5 — TanStack Start SPA Migration

| Step | Description | Status |
|------|------------|--------|
| 0 | Vite SPA → TanStack Start SPA mode | ✅ Done |

### Section 3 — Auth Backend & Middleware

| Step | Description | Status |
|------|------------|--------|
| 8 | Better Auth Server Setup | ✅ Done |
| 9 | Auth API Route Handler | ✅ Done |
| 10 | oRPC Auth Middleware Stack | ✅ Done |
| 11 | Frontend Auth Flow & Stores | ✅ Done |

### Section 4 — oRPC Foundation & Root Router

| Step | Description | Status |
|------|------------|--------|
| 12 | oRPC Server Setup & Root Router | ✅ Done |
| 13 | Shared Validators & API Utilities | ✅ Done |

### Section 5 — Tenant & Org Structure

| Step | Description | Status |
|------|------------|--------|
| 14 | Tenant & Unit API Routers | ✅ Done |
| 15 | Tenant Frontend — Unit Management & Switcher | ✅ Done |

### Section 6 — Academic Year Management

| Step | Description | Status |
|------|------------|--------|
| 16 | Academic Year API Router | ✅ Done |
| 17 | Academic Year Frontend | ✅ Done |

### Section 7 — Dashboard & Activity Log

| Step | Description | Status |
|------|------------|--------|
| 18 | Dashboard API Router | ✅ Done |
| 19 | Dashboard Frontend | ✅ Done |

### Section 8 — Teacher Management

| Step | Description | Status |
|------|------------|--------|
| 20 | Teacher API Router | ❌ Not Started |
| 21 | Teacher Frontend — Table & CRUD | ❌ Not Started |
| 22 | Teacher Bulk Import & Export | ❌ Not Started |

### Section 9 — Class & Student Management

| Step | Description | Status |
|------|------------|--------|
| 23 | Class API Router | ❌ Not Started |
| 24 | Class Frontend | ❌ Not Started |
| 25 | Student API Router | ❌ Not Started |
| 26 | Student Frontend — List & Registration | ❌ Not Started |
| 27 | Student Detail Page & Status Transitions | ❌ Not Started |

### Section 10 — SPP Payment System

| Step | Description | Status |
|------|------------|--------|
| 28 | SPP Configuration API Router | ❌ Not Started |
| 29 | SPP Configuration Frontend | ❌ Not Started |
| 30 | SPP Payment Recording API | ❌ Not Started |
| 31 | SPP Payment Recording Frontend | ❌ Not Started |
| 32 | SPP Monitoring API — Payment Matrix & Arrears | ❌ Not Started |
| 33 | SPP Monitoring Frontend — Payment Matrix | ❌ Not Started |
| 34 | SPP Bill Auto-Generation Job | ❌ Not Started |

### Section 11 — Cashflow, Events & Export

| Step | Description | Status |
|------|------------|--------|
| 35 | Cashflow API Router | ❌ Not Started |
| 36 | Cashflow Frontend | ❌ Not Started |
| 37 | Events API Router | ❌ Not Started |
| 38 | Events Frontend — Table & Calendar | ❌ Not Started |
| 39 | User Management & RBAC Frontend | ❌ Not Started |
| 40 | Student Bulk Import & Final Polish | ❌ Not Started |
