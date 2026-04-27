import { describe, expect, it } from 'vitest'
import {
  getAuthRedirectTarget,
  getPostSignInTarget,
  shouldAllowProtectedRoute,
  shouldRedirectAuthenticatedUser,
} from '@/lib/auth-routing'

describe('auth-routing', () => {
  it('redirects unauthenticated users to sign-in with the current path', () => {
    expect(getAuthRedirectTarget('/students?tab=active')).toEqual({
      to: '/sign-in',
      search: { redirect: '/students?tab=active' },
    })
  })

  it('falls back to the dashboard when no redirect is provided after sign-in', () => {
    expect(getPostSignInTarget()).toBe('/')
    expect(getPostSignInTarget('')).toBe('/')
  })

  it('uses the requested redirect after sign-in when present', () => {
    expect(getPostSignInTarget('/teachers')).toBe('/teachers')
  })

  it('blocks unauthenticated users from protected routes', () => {
    expect(shouldAllowProtectedRoute(null)).toBe(false)
    expect(
      shouldAllowProtectedRoute({
        session: { id: 'session-1' },
        user: { id: 'user-1' },
      })
    ).toBe(true)
  })

  it('redirects authenticated users away from public auth pages', () => {
    expect(shouldRedirectAuthenticatedUser(null)).toBe(false)
    expect(
      shouldRedirectAuthenticatedUser({
        session: { id: 'session-1' },
        user: { id: 'user-1' },
      })
    ).toBe(true)
  })
})
