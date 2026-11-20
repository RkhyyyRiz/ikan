import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Budi Daya Ikan Kalbar — Ikan Segar Langsung dari Kolam', template: '%s | Budi Daya Ikan Kalbar' },
  description: 'Beli ikan nila, lele, dan patin segar langsung dari pembudidaya di Kalimantan Barat. Pesan hidup, segar, atau bersih siap masak.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b5d54' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
