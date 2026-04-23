import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders()
  const result = await auth.api.getSession({ headers })
  return result
})

export const requireSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders()
  const result = await auth.api.getSession({ headers })
  if (!result?.session || !result?.user) {
    throw new Error("Unauthorized")
  }
  return result
})

export const signInEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    return await auth.api.signInEmail({
      body: data,
      headers,
    })
  })

export const signUpEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; name?: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    return await auth.api.signUpEmail({
      body: data,
      headers,
    })
  })

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const headers = getRequestHeaders()
  return await auth.api.signOut({ headers })
})