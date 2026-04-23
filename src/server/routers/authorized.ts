import { base } from './context'
import { authMiddleware } from './middlewares/auth'

export const authorized = base.use(authMiddleware)

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
}