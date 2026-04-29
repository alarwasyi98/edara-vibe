import { base } from './context'
import { authMiddleware, requireUnitContextMiddleware } from './middlewares'
import type { Role } from '@/lib/constants'
import type { db } from '@/server/db'

export const authorized = base
  .use(authMiddleware)
  .use(requireUnitContextMiddleware)

export type AuthContext = {
  session: {
    id: string
    expiresAt: Date
    token: string
    userId: string
  }
  user: {
    id: string
    name: string | null
    email: string
    image?: string | null
  }
  schoolId: string
  unitId: string | null
  role: Role
  assignmentId: string | null
  tx: typeof db
}
