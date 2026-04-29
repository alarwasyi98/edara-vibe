/**
 * Require Role Middleware Factory
 *
 * Creates a middleware that checks whether the authenticated user's
 * resolved role is in the list of allowed roles.
 *
 * Usage:
 *   const adminOnly = requireRole(['super_admin', 'kepala_sekolah'])
 *   const procedure = authorized.use(adminOnly).handler(...)
 *
 * Must be chained AFTER requireUnitContext (which injects `role`).
 */

import { ORPCError } from '@orpc/server'
import { base } from '../context'
import type { Role } from '@/lib/constants'

export function requireRole(allowedRoles: Role[]) {
  return base.middleware(async ({ context, next }) => {
    const { role } = context as { role: Role | null }

    if (!role || !allowedRoles.includes(role)) {
      throw new ORPCError(
        'FORBIDDEN',
        `Access denied. Required role: ${allowedRoles.join(' | ')}`,
      )
    }

    return next()
  })
}
