---
name: clerk-to-betterauth-migration
description: Migration design from Clerk to Better Auth for EDARA
status: in-review
modified: 2026-04-18
version: 1.1.0
---

# Migration Design: Clerk → Better Auth

**Date:** 2026-04-18
**Status:** In Review (v1.1)
**Version:** 1.1.0
**Previous Review:** v1.0 approved with feedback incorporated

---

## Overview

Migrate EDARA's authentication from Clerk (external SaaS) to Better Auth (self-hosted) using Neon PostgreSQL as the session store.

**Scope:** Phase 1 MVP Authentication
**Approach:** Minimal — Users self-signup, admin assigns roles later

---

## Assumptions

- No existing Clerk users in production yet (fresh start)
- No 2FA enabled in current Clerk setup
- No phone authentication in current setup
- Neon DB is the primary database for both app data and auth
- Using TanStack Start with oRPC for backend

---

## Architecture

### Before

```
┌─────────────┐
│  Clerk UI   │ (external hosted)
│ (iframed)  │
└──────┬──────┘
       │
       ▼ (JWT via Clerk SDK)
┌─────────────┐
│ Clerk SDK   │ (frontend only)
│ @clerk/*   │
└─────────────┘
       │
       ▼ (external API)
┌─────────────┐
│ Clerk API   │ (vendor-managed)
└─────────────┘
```

### After

```
┌─────────────┐
│ Better Auth│ (self-hosted)
│ UI Pages   │ (custom built)
└──────┬──────┘
       │
       ▼ (session cookie)
┌─────────────┐
│ oRPC Router│ (TanStack Start)
│ /auth      │
└──────┬──────┘
       │
       ▼ (SQL)
┌─────────────┐
│ Neon DB     │ (same instance)
│ +better-auth│
└─────────────┘
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Same Neon DB | Single source of truth, no sync needed |
| User signup | Minimal | Users self-register, admin assigns roles later |
| Multi-tenancy | Better Auth Organizations | Native org support, cleaner architecture |
| Session storage | Neon DB | Already configured for app data |
| User management | List + role assignment | Admin assigns roles from table |
| Migration | Fresh start (no existing users) | No Clerk user migration needed |

---

## Database Schema

### New Tables (Better Auth)

Better Auth creates these automatically via adapter:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, name, image) |
| `sessions` | Active sessions with expiration |
| `accounts` | OAuth provider links |
| `verifications` | Email verification tokens |
| `organization` | Better Auth orgs (→ schools) |
| `organization_member` | User-org links with role |
| `organization_invite` | Pending org invitations |

### Schema Changes

**File:** `src/server/db/schema/users.ts`

```typescript
// Remove clerkUserId dependency
// Use better-auth's user.id instead
export const userSchoolAssignments = pgTable(
  'user_school_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(), // better-auth user.id
    schoolId: uuid('school_id').references(() => schools.id).notNull(),
    unitId: uuid('unit_id').references(() => schoolUnits.id),
    role: userRoleEnum('role').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('user_assignments_user_idx').on(t.userId),
    schoolIdx: index('user_assignments_school_idx').on(t.schoolId),
  })
)
```

---

## Dependencies

### Remove

```json
{
  "@clerk/backend": "^3.2.8",
  "@clerk/clerk-react": "^5.58.1"
}
```

### Add (Current Versions as of 2026)

```json
{
  "better-auth": "^1.6.0",
  "@better-auth/drizzle-adapter": "^1.6.0"
}
```

> **Note:** Verify exact versions on npm. The Drizzle adapter is now `@better-auth/drizzle-adapter`. No separate `@auth/*` packages needed unless using legacy Auth.js features.

---

## Frontend Implementation

### Routes Structure

```
src/routes/
├── auth/                    NEW (replaces /clerk)
│   ├── route.tsx            → AuthProvider wrapper
│   ├── (auth)/
│   │   ├── route.tsx        → Layout without sidebar
│   │   ├── sign-in.tsx      → Custom sign-in form
│   │   ├── sign-up.tsx      → Custom sign-up form
│   │   └── _index.tsx      → Redirect to sign-in
│   └── _authenticated/
│       └── route.tsx        → Auth required guard
```

### Sign-In Page (`/auth/sign-in`)

- Email + password form
- "Forgot password?" link (Phase 2)
- "Sign up" link to `/auth/sign-up`
- Success → redirect to `/` (dashboard)
- Loading state with skeleton
- Error display for invalid credentials

### Sign-Up Page (`/auth/sign-up`)

- Email + password + confirm password
- Name field (optional)
- Terms acceptance checkbox
- Email verification (Phase 2 — disabled in MVP)
- Success → redirect to `/` (dashboard)
- Loading state with skeleton

### UI Design Notes

- Use existing shadcn/ui components (Input, Button, Label, Form)
- Consider starting with `better-auth-ui` components as base, then customize for your design system
- Implement accessible labels and ARIA attributes
- Mobile-responsive layout
- Same visual treatment as original Clerk pages (Forest/Amber palette)

### User Management Page

`/auth/_authenticated/user-management.tsx` (existing path):

- Table columns: Email, Name, Organization (School), Role, Status, Actions
- Actions: Edit role dropdown, Toggle active
- Uses oRPC query to fetch all users
- Role dropdown syncs with `user_school_assignments.role`

---

## Backend Implementation

### Auth Configuration

**File:** `src/server/auth/index.ts`

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db } from '@/server/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false, // Phase 1 MVP
  },
  organization: {
    enabled: true,
    defaultRole: 'member',
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,   // 1 day
    cookieCacheUntil: 60 * 60 * 24,
  },
  advanced: {
    // Generate UUIDs that match your existing format
    generateId: () => crypto.randomUUID(),
  },
})
```

**Plugins to consider (Phase 2):**
- Rate limiting plugin
- Two-factor authentication

### oRPC Auth Router

**File:** `src/server/routers/auth.ts`

```typescript
import { ORPCError, oRPCRouter } from '@orpc/server'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { userSchoolAssignments } from '@/server/db/schema/users'

export const authRouter = oRPCRouter({
  signIn: procedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const result = await auth.api.signIn.email({
        body: {
          email: input.email,
          password: input.password,
        },
      })

      if (!result) {
        throw new ORPCError('UNAUTHORIZED', 'Invalid email or password')
      }

      return result
    }),

  signUp: procedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existing = await auth.api.getUser({
        userId: input.email, // This won't work - need proper lookup
      })

      const result = await auth.api.signUp.email({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      })

      return result
    }),

  getSession: procedure.query(async ({ headers }) => {
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new ORPCError('UNAUTHORIZED', 'No active session')
    }

    return session
  }),

  listUsers: procedure
    .use(requireRole(['super_admin']))
    .query(async () => {
      const users = await db.query.userSchoolAssignments.findMany({
        orderBy: [desc(userSchoolAssignments.assignedAt)],
      })
      return users
    }),

  updateUserRole: procedure
    .use(requireRole(['super_admin']))
    .input(z.object({
      userId: z.string(),
      role: userRoleEnum,
      schoolId: z.uuid(),
    }))
    .mutation(async ({ input }) => {
      await db
        .update(userSchoolAssignments)
        .set({ role: input.role })
        .where(
          and(
            eq(userSchoolAssignments.userId, input.userId),
            eq(userSchoolAssignments.schoolId, input.schoolId)
          )
        )
    }),
})
```

---

## Middleware Updates

### Session Verification

**File:** `src/server/middleware/auth.ts`

```typescript
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { userSchoolAssignments } from '@/server/db/schema/users'
import { eq, and } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'

export async function requireAuth(headers: Headers) {
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new ORPCError('UNAUTHORIZED', 'No active session')
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  return async (c: { headers: Headers; session: Session }) => {
    const assignments = await db.query.userSchoolAssignments.findMany({
      where: and(
        eq(userSchoolAssignments.userId, c.session.user.id),
        eq(userSchoolAssignments.isActive, true)
      ),
    })

    const userRole = assignments[0]?.role

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ORPCError('FORBIDDEN', 'Insufficient permissions')
    }

    return c
  }
}
```

### RLS Context (Multi-Tenancy)

```typescript
export async function setTenantContext(session: Session) {
  // Set RLS session variables
  await db.execute(sql`
    SET app.current_user_id = ${session.user.id}
  `)

  // Get user school assignments from our table
  const assignments = await db.query.userSchoolAssignments.findMany({
    where: eq(userSchoolAssignments.userId, session.user.id),
  })

  // Set primary school context
  if (assignments.length > 0) {
    const primary = assignments[0]
    await db.execute(sql`
      SET app.current_school = ${primary.schoolId}
    `)
    if (primary.unitId) {
      await db.execute(sql`
        SET app.current_unit = ${primary.unitId}
      `)
    }
  }

  return {
    userId: session.user.id,
    schoolId: assignments[0]?.schoolId,
    unitId: assignments[0]?.unitId,
    role: assignments[0]?.role,
  }
}
```

---

## Role Sync Strategy

### Current State

| Source | Role Values |
|--------|------------|
| Better Auth Organization | `owner`, `admin`, `member`, `guest` |
| Your `user_school_assignments` | `super_admin`, `kepala_sekolah`, `admin_tu`, `bendahara` |

### Sync Approach

1. **Separate sources**: Better Auth orgs handle access to organization data; `user_school_assignments` handles your custom RBAC roles
2. **On first login**: If user has no assignment, they get "pending" status — admin assigns role later in user management
3. **Organization membership**: Auto-added when user is assigned to a school in your table
4. **Default role in Better Auth**: Set to `member` for all new orgs

### User Onboarding Flow (MVP)

```
1. User signs up at /auth/sign-up
2. User added to Better Auth users table
3. User redirected to dashboard (no school access yet)
4. Super admin assigns role/school in /user-management
5. User can now access their assigned school data
```

This ensures no orphaned access — every user must be explicitly assigned.

---

## Security & Production Readiness

### Session Cookie Settings

```typescript
// In auth config or client
{
  session: {
    // HTTPS only in production
    cookieSecure: process.env.NODE_ENV === 'production',
    // Prevent XSS from accessing cookie
    cookieHttpOnly: true,
    // CSRF protection
    cookieSameSite: 'lax',
    // Path scope
    cookiePath: '/',
  }
}
```

### Rate Limiting (Phase 2 - Recommended)

- Add rate limiting to sign-in endpoint
- Better Auth has official rate limiting plugin
- Recommended: 5 attempts per 5 minutes per IP

### Error Handling

| Error Code | Message | Scenario |
|------------|---------|-----------|
| `UNAUTHORIZED` | "Invalid email or password" | Wrong credentials |
| `UNAUTHORIZED` | "Account not found" | Email not registered |
| `FORBIDDEN` | "Insufficient permissions" | Role doesn't allow action |
| `TOO_MANY_REQUESTS` | "Too many attempts" | Rate limit exceeded |

---

## Migration Path

### Phase 0: Preparation (If Needed)

| Step | Task | Notes |
|------|------|-------|
| 0.1 | Export current Clerk users (if any) | CSV or API |
| 0.2 | Create Neon branch for testing | `edara-migration-test` |
| 0.3 | Test migration script on branch | If users exist |
| 0.4 | Verify foreign keys work | No broken links |

> **Current assumption:** No existing users, skip to Phase 1

### Phase 1: Core Migration

| Step | Task | Files |
|------|------|-------|
| 1.1 | Remove Clerk packages, install better-auth | `package.json` |
| 1.2 | Create auth config | `src/server/auth/index.ts` |
| 1.3 | Update user schema | `src/server/db/schema/users.ts` |
| 1.4 | Run DB setup (creates better-auth tables) | `drizzle-kit push` or direct |
| 1.5 | Build auth oRPC router | `src/server/routers/auth.ts` |
| 1.6 | Create middleware | `src/server/middleware/auth.ts` |
| 1.7 | Build sign-in page | `src/routes/auth/(auth)/sign-in.tsx` |
| 1.8 | Build sign-up page | `src/routes/auth/(auth)/sign-up.tsx` |
| 1.9 | Update user management page | `src/routes/auth/_authenticated/user-management.tsx` |
| 1.10 | Delete old clerk routes | `src/routes/clerk/` |

### Phase 2: Enhancements (Post-MVP)

| Task | Description |
|------|-------------|
| Email verification | Send verification emails |
| Password reset | Forgot password flow |
| OAuth providers | Google, GitHub login |
| Organization switcher | Multi-org user UI |
| Rate limiting | Sign-in protection |
| Two-factor auth | 2FA for sensitive roles |

---

## Rollback Plan

If migration fails:

1. **Keep Clerk routes temporarily** — Don't delete `/clerk/` until new auth is verified
2. **Dual auth period** — Run both in parallel during testing
3. **Neon branch rollback** — Use Neon branches to preserve working state
4. **Revert package.json** — Keep Clerk packages until full cutover

---

## Acceptance Criteria

- [ ] Users can sign up with email + password
- [ ] Users can sign in with email + password
- [ ] Session persists across page refreshes
- [ ] Session cookie is secure (httpOnly, sameSite)
- [ ] Super admin can view all users
- [ ] Super admin can assign roles to users
- [ ] Unauthorized users redirected to sign-in
- [ ] Old `/clerk/` routes removed
- [ ] All existing features work with new auth
- [ ] No 500 errors on auth endpoints

---

## Testing Strategy

### Unit Tests
- Auth router signIn/signUp procedures
- Middleware role checks
- RBAC enforcement tests

### E2E Tests
- Full sign-up flow
- Full sign-in flow
- Session persistence
- Role-based access

### Manual Testing
- Sign in from different browser
- Check session expiry
- Test admin role assignment

---

## External Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Migration Guide](https://better-auth.com/docs/guides/clerk-migration-guide)
- [Better Auth LLMs.txt](https://better-auth.com/llms.txt)
- [Better Auth Drizzle Adapter](https://www.better-auth.com/docs/integrations/drizzle)
- [Neon Documentation](https://neon.tech/docs)

---

**End of Design Document**
