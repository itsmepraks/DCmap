import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DC Map - Interactive Washington D.C. Explorer',
  description: 'An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations, immersive fly mode, and landmark discovery.',
  keywords: ['Washington DC', 'DC Map', 'interactive map', 'Mapbox', 'landmarks', 'museums', 'exploration', '3D map'],
  openGraph: {
    title: 'DC Map - Interactive Washington D.C. Explorer',
    description: 'An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations, immersive fly mode, and landmark discovery.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DC Map - Interactive Washington D.C. Explorer',
    description: 'An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations, immersive fly mode, and landmark discovery.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

