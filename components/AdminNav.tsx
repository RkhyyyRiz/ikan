'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/admin', label: 'Ringkasan & Rekap' },
  { href: '/admin/products', label: 'Produk Ikan' },
  { href: '/admin/orders', label: 'Pesanan' },
]

export default function AdminNav() {
  const path = usePathname()
  return (
    <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
      {ITEMS.map((i) => {
        const on = i.href === '/admin' ? path === '/admin' : path.startsWith(i.href)
        return (
          <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined}
            className={`min-h-[40px] shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${on ? 'border-ink bg-ink text-white' : 'border-line bg-card'}`}>{i.label}</Link>
        )
      })}
    </nav>
  )
}
