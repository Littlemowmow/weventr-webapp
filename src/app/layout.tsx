import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Weventr — Travel Beyond Tourism',
  description: 'Discover hidden experiences, build trips with friends, and immerse yourself in cultures worldwide.',
  openGraph: {
    title: 'Weventr — Travel Beyond Tourism',
    description: 'Discover hidden experiences, build trips with friends, and immerse yourself in cultures worldwide.',
    url: 'https://weventr.com',
    siteName: 'Weventr',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
