export type AuthSessionLike =
  | {
      session: { id: string }
      user: { id: string }
    }
  | null
  | undefined

export function getAuthRedirectTarget(currentPath: string): {
  to: '/sign-in'
  search: { redirect: string }
} {
  return {
    to: '/sign-in',
    search: { redirect: currentPath },
  }
}

export function getPostSignInTarget(redirect?: string): string {
  return redirect && redirect.length > 0 ? redirect : '/'
}

export function shouldAllowProtectedRoute(
  sessionData: AuthSessionLike,
): boolean {
  return Boolean(sessionData?.session && sessionData?.user)
}

export function shouldRedirectAuthenticatedUser(
  sessionData: AuthSessionLike,
): boolean {
  return shouldAllowProtectedRoute(sessionData)
}
