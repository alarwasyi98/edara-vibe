import { type QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { ThemeProvider } from '@/context/theme-provider'
import '../styles/index.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'Edara - Madrasah Connect' },
      {
        name: 'description',
        content:
          'Edara - Madrasah Connect adalah aplikasi administrasi terpadu untuk madrasah yang memudahkan pengelolaan data dan informasi.',
      },
      { name: 'theme-color', content: '#fff' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://edara.vercel.app/' },
      { property: 'og:title', content: 'Edara - Madrasah Connect' },
      {
        property: 'og:description',
        content:
          'Edara - Madrasah Connect adalah aplikasi administrasi terpadu untuk madrasah yang memudahkan pengelolaan data dan informasi.',
      },
      {
        property: 'og:image',
        content: 'https://edara.vercel.app/images/madrasah-connect.webp',
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: 'https://edara.vercel.app/' },
      { property: 'twitter:title', content: 'Edara - Madrasah Connect' },
      {
        property: 'twitter:description',
        content:
          'Edara - Madrasah Connect adalah aplikasi administrasi terpadu untuk madrasah yang memudahkan pengelolaan data dan informasi.',
      },
      {
        property: 'twitter:image',
        content: 'https://edara.vercel.app/images/madrasah-connect.webp',
      },
    ],
    links: [
      // Favicons
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/images/favicon.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/images/favicon_light.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/images/favicon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/images/favicon_light.png',
        media: '(prefers-color-scheme: dark)',
      },
      // Google Fonts
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'style',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Fira+Code:wght@300..700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Fira+Code:wght@300..700&display=swap',
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

function RootComponent() {
  const queryClient = Route.useRouteContext({
    select: (ctx) => ctx.queryClient,
  })

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <NavigationProgress />
                <Outlet />
                <Toaster duration={5000} />
                {import.meta.env.MODE === 'development' && (
                  <>
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                    <TanStackRouterDevtools position="bottom-right" />
                  </>
                )}
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
