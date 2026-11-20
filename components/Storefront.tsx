'use client'

import { useMemo, useState } from 'react'
import OrderDrawer from '@/components/OrderDrawer'
import { kg, rupiah, tanggal } from '@/lib/format'
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
  const [tab, setTab] = useState<FilterTab>('all')

  const counts = useMemo(() => {
    return {
      all: products.length,
      ready: products.filter((p) => p.availability_type === 'ready' && p.stock_kg > 0).length,
      preorder: products.filter((p) => p.availability_type === 'preorder').length,
      wholesale: products.filter((p) => p.wholesale_price_per_kg != null).length,
    }
  }, [products])

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

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Ikan', count: counts.all },
    { id: 'ready', label: 'Siap Kirim', count: counts.ready },
    { id: 'preorder', label: 'Pre-Order', count: counts.preorder },
    { id: 'wholesale', label: 'Harga Grosir', count: counts.wholesale },
  ]

  return (
    <>
      <div className="mb-6 space-y-3.5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ikan nila, patin, lele, gurame..."
            className="input !rounded-2xl !pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-river text-white shadow-sm shadow-river/25'
                    : 'border border-line bg-white text-mute hover:border-river/40 hover:text-ink'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                    active ? 'bg-white/20 text-white' : 'bg-paper text-mute'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base font-bold text-ink">Produk ikan tidak ditemukan</p>
          <p className="mt-1 text-sm text-mute">
            Coba kata kunci lain atau pilih kategori &ldquo;Semua Ikan&rdquo;.
          </p>
          {(search || tab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setTab('all')
              }}
              className="btn-outline mt-4 !min-h-[38px] !rounded-full text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const soldOut = p.stock_kg <= 0 && p.availability_type !== 'preorder'
            const isPreorder = p.availability_type === 'preorder'

            return (
              <li
                key={p.id}
                className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-river/40 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100/70">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-river/40">
                      <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                        <path d="M18 12v.5" />
                        <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
                      </svg>
                      <span className="mt-1 text-xs font-medium">Foto Segera Hadir</span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {soldOut ? (
                      <span className="badge bg-merah text-white shadow-sm">Stok Habis</span>
                    ) : isPreorder ? (
                      <span className="badge bg-amber-500 text-white shadow-sm">Pre-Order Panen</span>
                    ) : (
                      <span className="badge bg-river text-white shadow-sm">● Siap Kirim</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-river transition-colors">
                        {p.name}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium text-mute">{p.size_spec}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-2xl font-extrabold text-river">
                      {rupiah(p.price_per_kg)}
                    </span>
                    <span className="text-xs font-semibold text-mute">/ kg</span>
                  </div>

                  {p.wholesale_price_per_kg != null && (
                    <div className="mt-2">
                      <span className="badge bg-river-soft text-river">
                        Grosir ≥ {kg(p.wholesale_min_kg)}: {rupiah(p.wholesale_price_per_kg)}/kg
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-center justify-between border-t border-line/70 pt-2.5 text-xs">
                      {soldOut ? (
                        <span className="font-semibold text-merah">Stok sedang kosong</span>
                      ) : (
                        <span className="text-mute">
                          Sisa stok: <strong className="font-bold text-ink">{kg(p.stock_kg)}</strong>
                        </span>
                      )}

                      {isPreorder && p.harvest_date && (
                        <span className="font-semibold text-kunyit">
                          Panen {tanggal(p.harvest_date)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSelected(p)}
                      className="btn-primary w-full !rounded-xl"
                    >
                      {soldOut
                        ? 'Stok Habis'
                        : isPreorder
                          ? 'Pre-Order Sekarang'
                          : 'Pesan Sekarang'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

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
