"use client";

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { createOrderAction } from '@/app/actions/orders'
import { calcLine, kg, PROCESSING_LABEL, rupiah } from '@/lib/format'
import type { PaymentMethod, Product, ProcessingOption, Profile } from '@/lib/types'

const PRESETS = [0.5, 1, 1.5, 2, 5]

export default function OrderDrawer({ product: p, profile, loggedIn, onClose }: { product: Product; profile: Profile | null; loggedIn: boolean; onClose: () => void }) {
  const stock = Number(p.stock_kg)
  const [weight, setWeight] = useState(Math.min(1, stock))
  const [processing, setProcessing] = useState<ProcessingOption>('segar_es')
  const [payment, setPayment] = useState<PaymentMethod>('transfer')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const valid = weight >= 0.5 && weight <= stock && Math.round(weight * 2) === weight * 2
  const line = calcLine(p, valid ? weight : 0, processing)
  const toWholesale = p.wholesale_price_per_kg != null && !line.wholesale ? Number(p.wholesale_min_kg) - weight : 0

  const options: { key: ProcessingOption; desc: string }[] = [
    { key: 'hidup', desc: 'Dibawa dalam keadaan hidup' },
    { key: 'segar_es', desc: 'Segar, dikemas dengan es' },
    { key: 'bersih_siap_masak', desc: `Disiangi & dibersihkan, + ${rupiah(p.cleaning_fee_per_kg)}/kg` },
  ]

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!valid) return setError(`Berat harus kelipatan 0,5 kg dan maksimal ${kg(stock)}.`)
    start(async () => {
      const res = await createOrderAction({ productId: p.id, weightKg: weight, processing, payment, phone, address, notes })
      if (res?.error) setError(res.error) // jika sukses, server mengarahkan ke halaman pesanan
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white">
      {/* Mint Top Showcase Header */}
      <div className="relative bg-gradient-to-b from-[#DFF3EA] to-[#EDF8F3] px-5 pb-12 pt-5">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:bg-emerald-50 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#124E3B]">
            {p.availability_type === 'preorder' ? 'Pre-Order Panen' : `Stok ${kg(stock)}`}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition hover:bg-emerald-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mx-auto mt-3 max-w-md">
          <h2 className="font-display text-2xl font-extrabold text-ink">{p.name}</h2>
          <p className="text-xs font-semibold text-mute">{p.size_spec}</p>

          <div className="relative mt-4 flex items-center justify-end">
            {/* Floating Price Card di Kiri */}
            <div className="absolute bottom-0 left-0 z-10 rounded-2xl bg-white px-4 py-3 shadow-md shadow-black/5">
              <span className="block text-[11px] font-semibold text-mute">Harga / kg</span>
              <span className="font-display text-xl font-extrabold text-[#15803D]">
                {rupiah(line.unit)}
              </span>
            </div>

            <div className="h-40 w-44 overflow-hidden rounded-3xl bg-white/60 shadow-inner">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#124E3B]/40">
                  <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                    <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* White Bottom Detail Sheet */}
      <form
        onSubmit={submit}
        className="mx-auto -mt-5 flex w-full max-w-md flex-1 flex-col rounded-t-[30px] bg-white px-5 pb-28 pt-6 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-extrabold text-ink">Pilih Kondisi Ikan</h3>
          {line.wholesale && (
            <span className="rounded-full bg-river-soft px-2.5 py-0.5 text-[11px] font-bold text-[#15803D]">
              Harga Grosir Aktif!
            </span>
          )}
        </div>

        {/* Option Pills */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {options.map((opt) => {
            const active = processing === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setProcessing(opt.key)}
                className={`rounded-2xl border p-2.5 text-left transition-all ${
                  active
                    ? 'border-[#124E3B] bg-[#124E3B] text-white shadow-sm'
                    : 'border-line bg-[#F6FAF8] text-ink hover:border-[#124E3B]/40'
                }`}
              >
                <span className="block text-xs font-extrabold capitalize">
                  {opt.key === 'hidup' ? 'Hidup' : opt.key === 'segar_es' ? 'Segar Es' : 'Bersih'}
                </span>
                <span className={`mt-0.5 block text-[10px] leading-tight ${active ? 'text-emerald-100' : 'text-mute'}`}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>

        {/* Select Weight Pills + Input */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label className="font-display text-sm font-extrabold text-ink">Pilih Berat (kg)</label>
            {toWholesale > 0 && (
              <span className="text-[11px] font-semibold text-[#15803D]">
                +{kg(toWholesale)} lagi dapat harga grosir
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {[0.5, 1, 2, 3, 5, 10].map((w) => {
              const active = weight === w
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`min-w-[48px] rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                    active
                      ? 'bg-[#124E3B] text-white shadow-sm'
                      : 'border border-line bg-white text-ink hover:bg-river-soft'
                  }`}
                >
                  {w} kg
                </button>
              )
            })}
          </div>

          <input
            type="number"
            step="0.5"
            min="0.5"
            max={stock}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="input mt-2.5 !rounded-xl"
            required
          />
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Alamat Pengiriman</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Ahmad Yani No. 12, Pontianak"
              className="input !min-h-[68px] !rounded-xl py-2"
              required
            />
          </div>

          <div>
            <label className="label">Catatan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Potong 3 bagian / kirim sore"
              className="input !rounded-xl"
            />
          </div>

          <div>
            <label className="label">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'transfer', label: 'QRIS / Transfer' },
                { id: 'cod', label: 'Bayar di Tempat (COD)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayment(m.id as PaymentMethod)}
                  className={`rounded-xl border py-2.5 text-xs font-extrabold transition ${
                    payment === m.id
                      ? 'border-[#124E3B] bg-[#EAF6F0] text-[#124E3B]'
                      : 'border-line bg-white text-mute'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-merah-soft px-3 py-2 text-xs font-semibold text-merah">
            {error}
          </p>
        )}

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-line/70 bg-white/95 px-5 py-3.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-ink transition hover:bg-river-soft"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!valid || pending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#124E3B] px-5 text-sm font-extrabold text-white shadow-md shadow-[#124E3B]/25 transition hover:bg-[#0D3A2C] active:scale-[0.98] disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>
                {pending
                  ? 'Memproses...'
                  : !loggedIn
                    ? 'Masuk untuk Pesan'
                    : `Pesan Sekarang • ${rupiah(line.subtotal)}`}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
