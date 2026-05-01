# Session Log — EDARA

> Layer 3: Episodic memory — what happened, when, and what changed.
> Append new sessions at the top. Never delete old entries.

## Current State Summary (as of Session 22)

| Property | Value |
|----------|-------|
| Branch | `dev` (synced with main, doc updates unstaged) |
| SHA | `d170c5f` (main), `0a4e848` (dev — sync commit) |
| Last PR | #21 (feat: wire academic years frontend to live API) |
| CI | Passing (format:check, typecheck, lint --max-warnings 10, build) |
| Deployment | https://edara.vercel.app/ (working, login functional) |
| Next Step | **Step 18: Dashboard API Router** (Section 7) |

### Step 18 Context for Next Session

**Goal:** Create `dashboardRouter` and `activityLogsRouter` with procedures for summary cards, cashflow chart, upcoming events, and recent activity.

**What's Done (Section 6 complete):**
- Academic Year API: list, getActive, create, update, activate (all working)
- Academic Year Frontend: wired to live API with useQuery/useMutation, react-hook-form, loading states, activate flow

**Next Step Requirements (Step 18, implementation-plan lines 349-362):**
1. Create `dashboardRouter` with: `getSummaryCards`, `getCashflowChart`, `getUpcomingEvents`, `getRecentActivity`
2. Create `activityLogsRouter` with: `list` (paginated, grouped by day)
3. Register both in `appRouter`
4. All dashboard queries are read-only, scoped by unit context

**Files to Create/Modify:**
- `src/server/routers/dashboard/index.ts` ← new: dashboardRouter
- `src/server/routers/activity-logs/index.ts` ← new: activityLogsRouter
- `src/lib/validators/dashboard.ts` ← new: dateRangeSchema for chart
- `src/server/routers/app-router.ts (exists)` ← register both routers

**Reference Patterns:**
- Router structure: see `src/server/routers/academic-years/index.ts`
- Middleware: `authorized` for reads, `tenantAdmin` for mutations
- Pagination: `src/server/utils/pagination.ts`

**Git Workflow Reminder:**
1. Create feature branch from `dev` (e.g., `feature/step-18-dashboard-api`)
2. Work on feature branch locally
3. Merge feature branch locally into `dev` (do NOT push feature branch)
4. **ASK user before pushing** dev and creating PR from dev → main
5. After PR merge, sync dev back to main

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
| 18 | Dashboard API Router | ❌ Not Started |
| 19 | Dashboard Frontend | ❌ Not Started |

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
