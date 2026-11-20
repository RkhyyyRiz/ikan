'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import OrderDrawer from '@/components/OrderDrawer'
import { kg, rupiah } from '@/lib/format'
import type { Product, Profile } from '@/lib/types'

type FilterTab = 'all' | 'ready' | 'preorder' | 'wholesale'

export default function Storefront({
  products,
  profile,
  loggedIn,
}: {
  products: Product[]
  profile: Profile | null
  loggedIn: boolean
}) {
  const [selected, setSelected] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [tab, setTab] = useState<FilterTab>('all')
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.size_spec.toLowerCase().includes(q)) {
        return false
      }
      if (tab === 'ready') return p.availability_type === 'ready' && p.stock_kg > 0
      if (tab === 'preorder') return p.availability_type === 'preorder'
      if (tab === 'wholesale') return p.wholesale_price_per_kg != null
      return true
    })
  }, [products, search, tab])

  const categories: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'Semua',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: 'ready',
      label: 'Siap Kirim',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
          <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
        </svg>
      ),
    },
    {
      id: 'preorder',
      label: 'Pre-Order',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      id: 'wholesale',
      label: 'Grosir',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m2 7 10-4 10 4-10 4-10-4Z" />
          <path d="m2 17 10 4 10-4" />
          <path d="m2 12 10 4 10-4" />
        </svg>
      ),
    },
  ]

  const dashboardHref = loggedIn ? (profile?.role === 'admin' ? '/admin' : '/dashboard') : '/login'

  return (
    <>
      {/* Squircle Category Bar (Persis Referensi) */}
      <div className="mb-6 flex items-center justify-between gap-2">
        {categories.map((c) => {
          const active = tab === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id)}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                  active
                    ? 'bg-[#124E3B] text-white shadow-md shadow-[#124E3B]/25'
                    : 'bg-[#F1F6F3] text-ink hover:bg-river-soft'
                }`}
              >
                {c.icon}
              </span>
              <span className={`text-xs font-semibold ${active ? 'text-[#124E3B]' : 'text-mute'}`}>
                {c.label}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex flex-1 flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
              showSearch || search
                ? 'bg-[#124E3B] text-white shadow-md shadow-[#124E3B]/25'
                : 'bg-[#F1F6F3] text-ink hover:bg-river-soft'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-mute">Cari</span>
        </button>
      </div>

      {(showSearch || search) && (
        <div className="mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ikan nila, patin, lele..."
            className="input !rounded-2xl !bg-[#F4F9F6]"
            autoFocus
          />
        </div>
      )}

      {/* Section Header */}
      <div id="katalog-ikan" className="mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">Pilihan Segar</h2>
        <button
          type="button"
          onClick={() => {
            setTab('all')
            setSearch('')
          }}
          className="text-xs font-semibold text-mute hover:text-[#124E3B]"
        >
          Lihat Semua ({products.length})
        </button>
      </div>

      {/* Product Cards (Mint Surface + Bottom Right Plus Button) */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-[#EAF6F0] p-8 text-center">
          <p className="font-bold text-ink">Ikan tidak ditemukan</p>
          <p className="mt-1 text-xs text-mute">Coba pilih kategori lain untuk melihat stok tersedia.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {filtered.map((p) => {
            const soldOut = p.stock_kg <= 0 && p.availability_type !== 'preorder'
            const isLiked = !!liked[p.id]

            return (
              <li
                key={p.id}
                onClick={() => !soldOut && setSelected(p)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-[24px] bg-[#EAF6F0] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  soldOut ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLiked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                    }}
                    aria-label="Favorit"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink/70 transition hover:bg-white/70"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 ${isLiked ? 'fill-merah text-merah' : 'fill-none text-ink'}`}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>

                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#124E3B]">
                    {soldOut ? 'Habis' : kg(p.stock_kg)}
                  </span>
                </div>

                {/* Product Image */}
                <div className="my-2.5 flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-14 w-14 text-[#124E3B]/35" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                      <path d="M18 12v.5" />
                      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
                    </svg>
                  )}
                </div>

                {/* Product Info + Floating Plus Button */}
                <div className="relative pr-9">
                  <h3 className="line-clamp-1 font-display text-[15px] font-extrabold text-ink">
                    {p.name}
                  </h3>
                  <p className="line-clamp-1 text-[11px] font-medium text-mute">{p.size_spec}</p>
                  <p className="mt-1.5 font-display text-base font-extrabold text-[#15803D]">
                    {rupiah(p.price_per_kg)}
                    <span className="text-[10px] font-semibold text-mute">/kg</span>
                  </p>

                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(p)
                    }}
                    aria-label={`Pesan ${p.name}`}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#124E3B] text-white shadow-sm transition hover:bg-[#0D3A2C] active:scale-90 disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Dashboard Card Section Below Catalog (Sesuai Permintaan) */}
      <section className="mt-7 rounded-[24px] border border-line bg-[#F6FBF8] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-[#124E3B]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#124E3B]">
              Dashboard Pelanggan
            </span>
            <h3 className="mt-1 font-display text-base font-extrabold text-ink">
              {loggedIn ? `Halo, ${profile?.full_name || 'Pelanggan'}` : 'Pantau Pesanan & Riwayat'}
            </h3>
            <p className="text-xs text-mute">
              {loggedIn
                ? 'Cek status pesanan, upload bukti QRIS, dan riwayat belanja Anda.'
                : 'Masuk untuk melacak pengiriman ikan & mengelola pesanan.'}
            </p>
          </div>

          <Link
            href={dashboardHref}
            className="shrink-0 rounded-full bg-[#124E3B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0D3A2C]"
          >
            {loggedIn ? (profile?.role === 'admin' ? 'Panel Admin' : 'Dashboard') : 'Masuk'}
          </Link>
        </div>
      </section>

      {/* Curved Dark Bottom Navigation Dock (100% Mirip Referensi + Dashboard) */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
      >
        <div className="relative flex h-16 items-center justify-around rounded-[28px] bg-[#131C18] px-3 text-white/65 shadow-xl shadow-black/25">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-[#34D399]"
            title="Beranda"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-semibold">Beranda</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setShowSearch(true)
              window.scrollTo({ top: 180, behavior: 'smooth' })
            }}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Cari Ikan"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="text-[10px] font-medium">Cari</span>
          </button>

          {/* Center Floating Circle Action */}
          <button
            type="button"
            onClick={() => {
              const firstAvail = products.find((item) => item.stock_kg > 0 || item.availability_type === 'preorder')
              if (firstAvail) setSelected(firstAvail)
            }}
            aria-label="Pesan Cepat"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#22A06B] to-[#124E3B] text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
              <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
            </svg>
          </button>

          <Link
            href={dashboardHref}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Pesanan"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="text-[10px] font-medium">Pesanan</span>
          </Link>

          <Link
            href={dashboardHref}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Dashboard"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
        </div>
      </nav>

      {selected && (
        <OrderDrawer
          product={selected}
          profile={profile}
          loggedIn={loggedIn}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
