import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Anima DC - Interactive D.C. Map',
  description: 'An interactive, animated digital portrait of Washington, D.C. showcasing dynamic data layers through elegant visualizations.',
  keywords: ['Washington DC', 'data visualization', 'interactive map', 'Mapbox'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

