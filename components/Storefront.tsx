'use client'

import { useMemo, useState } from 'react'
import OrderDrawer from './OrderDrawer'
import { kg, rupiah, tanggal } from '@/lib/format'
import type { Product, Profile } from '@/lib/types'

type Tab = 'semua' | 'ready' | 'preorder'
const TABS: { key: Tab; label: string }[] = [
  { key: 'semua', label: 'Semua' }, { key: 'ready', label: 'Ready Hari Ini' }, { key: 'preorder', label: 'Pre-Order Panen' },
]

export default function Storefront({ products, profile, loggedIn }: { products: Product[]; profile: Profile | null; loggedIn: boolean }) {
  const [tab, setTab] = useState<Tab>('semua')
  const [selected, setSelected] = useState<Product | null>(null)
  const list = useMemo(() => products.filter((p) => tab === 'semua' || p.availability_type === tab), [products, tab])

  return (
    <>
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-semibold ${tab === t.key ? 'border-river bg-river text-white' : 'border-line bg-card text-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card p-8 text-center text-mute">Belum ada ikan di kategori ini. Coba lihat kategori lain.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const soldOut = Number(p.stock_kg) < 0.5
            return (
              <li key={p.id} className="card flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] bg-river-soft">
                  {p.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    : <div className="grid h-full place-items-center text-river/50"><svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12c3-5 8-6 12-4l4-2-1 5 2 4-5-1c-4 2-9 1-12-2z" /></svg></div>}
                  {p.availability_type === 'preorder' && <span className="badge absolute left-3 top-3 bg-kunyit-soft text-kunyit">Pre-Order</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-lg font-bold leading-snug">{p.name}</h2>
                  <p className="text-sm text-mute">{p.size_spec}</p>
                  <p className="mt-3 font-display text-2xl font-extrabold">{rupiah(p.price_per_kg)}<span className="text-sm font-medium text-mute"> /kg</span></p>
                  {p.wholesale_price_per_kg != null && (
                    <p className="mt-1.5"><span className="badge bg-river-soft text-river">Grosir ≥ {kg(p.wholesale_min_kg)}: {rupiah(p.wholesale_price_per_kg)}/kg</span></p>
                  )}
                  <p className="mt-3 text-sm">{soldOut ? <span className="font-semibold text-merah">Stok habis</span> : <>Sisa stok <b>{kg(p.stock_kg)}</b></>}</p>
                  {p.availability_type === 'preorder' && p.harvest_date && <p className="text-sm text-kunyit">Panen {tanggal(p.harvest_date)}</p>}
                  <button disabled={soldOut} onClick={() => setSelected(p)} className="btn-primary mt-4 w-full">{soldOut ? 'Stok Habis' : p.availability_type === 'preorder' ? 'Pre-Order Sekarang' : 'Pesan Sekarang'}</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {selected && <OrderDrawer product={selected} profile={profile} loggedIn={loggedIn} onClose={() => setSelected(null)} />}
    </>
  )
}
