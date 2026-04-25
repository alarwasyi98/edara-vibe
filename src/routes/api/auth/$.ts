import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

const routeOptions = {
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return auth.handler(request)
      },
      POST: async ({ request }: { request: Request }) => {
        return auth.handler(request)
      },
    },
  },
} as const

export const Route = createFileRoute('/api/auth/$')(routeOptions as never)
