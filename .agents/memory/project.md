# Project Memory — EDARA

> Layer 2: Feature inventory, known gotchas, active constraints, and current state.
> Updated as features are implemented or blockers are discovered.

---

## Current Status

- **Phase:** Phase 1 — Migration from Mock to Real Backend
- **Progress:** Sections 1–7 are complete through Step 19, and Section 8 Steps 20–21 are complete. Live today: auth runtime, tenant/school-unit flows, academic years, dashboard, activity logs, and Teacher Management list/detail/create/update/deactivate flows. Teacher import/export remains intentionally unavailable, and the remaining domain areas are still being migrated from mock data.
- **Active Branch:** Do not rely on this file for branch state; verify with `git status` / `git log`.
- **Implementation Plan:** Sections 1–7 are complete, Section 8 Steps 20–21 are complete, and the next milestone is the next migration step after Teacher Management frontend wiring.

## Feature Inventory

| # | Feature | Spec IDs | Status | Notes |
|---|---------|----------|--------|-------|
| 1 | Multi-Tenant Management | MT-01–05 | Schema ✅, API ✅, UI ✅ | School + unit flows are wired through live tenant routers and authenticated unit context |
| 2 | Auth & RBAC | AUTH-01–05 | Schema ✅, Runtime ✅ | Better Auth session flow, route protection, and EDARA RBAC/unit-context middleware are live |
| 3 | Academic Year | AY-01–04 | Schema ✅, API ✅, UI ✅ | Timeline, form modal, activation flow wired to live API |
| 4 | Dashboard | DASH-01–05 | Schema ✅, API ✅, UI ✅ | Summary cards, cashflow chart, upcoming events, and recent activity use live API data |
| 5 | Teachers | TCH-01–05 | Schema ✅, API ✅, UI ✅ (import/export deferred) | Step 20 complete: tenant-scoped teacher router (`list`, `getById`, `create`, `update`, `deactivate`) + validators live. Step 21 complete: teacher list, detail, create, update, and deactivate now use live API; import/export remain disabled placeholders |
| 6 | Classes | CLS-01–03 | Schema ✅, API ❌, UI mock | Class Grid per grade, Mass Promotion 3-step modal |
| 7 | Students | STU-01–06 | Schema ✅, API ❌, UI mock | Registration Drawer, Detail Page with tabs, Status Transitions |
| 8 | SPP Payment | SPP-01–10 | Schema ✅, API ❌, UI mock | Config, Recording (4-step), Monitoring (payment matrix) |
| 9 | Cashflow | CF-01–04 | Schema ✅, API ❌, UI mock | Summary cards, chart, transaction table, auto-link from SPP |
| 10 | Events/Calendar | EVT-01–04 | Schema ✅, API ❌, UI mock | DataTable tab, Calendar tab with chips, Side Drawer |

## Database Schema (18 Tables)

All tables defined in Drizzle ORM under `src/server/db/schema/`:

| Domain | Tables |
|--------|--------|
| Core | `schools`, `school_units` |
| Academic | `academic_years` |
| Personnel | `teachers` |
| Students | `students` |
| Classes | `classes` |
| Enrollments | `enrollments`, `enrollment_status_history` |
| SPP | `payment_categories`, `class_payment_rates`, `discount_schemes`, `payment_bills`, `payment_transactions` |
| Cashflow | `cashflow_categories`, `cashflow_transactions` |
| Events | `school_events` |
| Users | `user_school_assignments` |
| Logs | `activity_logs` |
| Auth (Better Auth) | `user`, `session`, `account`, `verification` |

## Known Gotchas

1. **Repo memory can drift faster than code** — Always cross-check `docs/implementation-plan.md`, `.agents/memory/log.md`, and `src/server/routers/app-router.ts` before assuming feature status.
2. **Backend coverage is partial, not absent** — Live routers exist for auth-adjacent tenant flows, academic years, dashboard, activity logs, and teachers; classes/students/SPP/cashflow/events are still pending.
3. **Frontend is mixed live + mock** — `academic-years`, `dashboard`, settings/unit flows, and core Teacher Management CRUD/list/detail are live, while classes/students/SPP/cashflow/events/users still contain local mock data and placeholder flows.
4. **Teacher import/export is intentionally deferred** — Step 21 leaves teacher import/export as disabled placeholders so the UI does not imply a live bulk flow that does not exist yet.
5. **Local build still needs env for prerender** — `pnpm build` compiles the app, but local prerender will fail without `DATABASE_URL` (and related runtime env) because the workspace cannot open Neon during prerender.
6. **Large chunk warning** — 581KB bundle remains a future optimization target.

## Active Constraints

- **No SSR** — Phase 1 is pure SPA
- **Mixed live/mock migration** — New work must preserve already-live flows while replacing remaining mock-backed feature modules incrementally
- **Windows-only dev** — PowerShell required, UNIX commands unreliable
- **pnpm only** — No npm/yarn

## Auth Migration Status (Clerk → Better Auth)

- **Decision:** Better Auth handles identity/session; EDARA handles tenancy/RBAC
- **Client layer:** `auth-client.ts`, `auth.functions.ts`, and auth routing are functional
- **Server layer:** Better Auth runtime and oRPC auth middleware are active; authenticated procedures flow through `context.ts`, auth middleware, and unit-context middleware
- **Route mounts:** Auth and RPC endpoints exist under `src/routes/api/auth/$` and `src/routes/api/rpc/$`
- **Current focus:** Auth foundation is in place for the live sections; remaining migration work should target unfinished domain routers and remaining mock-backed frontend feature rewiring
