import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: (() => {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').trim()
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    try {
      return new URL(withProto)
    } catch {
      return new URL('http://localhost:3000')
    }
  })(),
  title: {
    default: 'Budi Daya Ikan Kalbar — Ikan Segar Langsung dari Kolam',
    template: '%s | Budi Daya Ikan Kalbar',
  },
  description:
    'Beli ikan nila, lele, dan patin segar langsung dari pembudidaya di Kalimantan Barat. Pesan hidup, segar, atau bersih siap masak.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
