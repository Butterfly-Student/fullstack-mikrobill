/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { seo } from '@/utils/seo'
import appCss from '@/styles/index.css?url'
import '@/styles/index.css'
import Providers from '@/components/providers'


export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "MikroBill | Mikrotik Billing System",
        description: `MikroBill is a dashboard monitoring for mikrotik and billing.`,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: () => {
    return (
      <RootDocument>
        <GeneralError />
      </RootDocument>
    )
  },
  notFoundComponent: () => (
    <RootDocument>
      <NotFoundError />
    </RootDocument>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}