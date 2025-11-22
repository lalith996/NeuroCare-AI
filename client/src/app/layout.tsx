import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'NeuroCare AI - Cognitive Assessment Platform',
  description: 'AI-powered cognitive assessment for Alzheimer\'s and MCI screening',
  keywords: ['cognitive assessment', 'Alzheimer\'s', 'MCI', 'healthcare', 'AI'],
  authors: [{ name: 'Lalith Machavarapu' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8B5CF6' },
    { media: '(prefers-color-scheme: dark)', color: '#7C3AED' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
