'use client'

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
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Pesan ${p.name}`} onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94dvh] w-full max-w-lg flex-col rounded-t-2xl bg-paper sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div><h2 className="text-lg font-bold">{p.name}</h2><p className="text-sm text-mute">{p.size_spec}</p></div>
          <button onClick={onClose} aria-label="Tutup" className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-2xl text-mute">×</button>
        </div>

        {!loggedIn ? (
          <div className="p-5">
            <p className="text-[15px]">Masuk atau daftar dulu untuk memesan ikan.</p>
            <div className="mt-4 flex gap-3"><Link href="/login" className="btn-primary flex-1">Masuk</Link><Link href="/register" className="btn-outline flex-1">Daftar</Link></div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <section>
                <p className="label">Berat (kg)</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.filter((w) => w <= stock).map((w) => (
                    <button type="button" key={w} onClick={() => setWeight(w)} aria-pressed={weight === w}
                      className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold ${weight === w ? 'border-river bg-river text-white' : 'border-line bg-card'}`}>{kg(w)}</button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" aria-label="Kurangi 0,5 kg" onClick={() => setWeight((w) => Math.max(0.5, w - 0.5))} className="btn-outline !w-11 !px-0 text-xl">−</button>
                  <input type="number" inputMode="decimal" step="0.5" min="0.5" max={stock} value={weight} aria-label="Berat kustom dalam kg"
                    onChange={(e) => setWeight(Number(e.target.value))} className="input text-center" />
                  <button type="button" aria-label="Tambah 0,5 kg" onClick={() => setWeight((w) => Math.min(stock, w + 0.5))} className="btn-outline !w-11 !px-0 text-xl">+</button>
                </div>
                {line.wholesale && <p className="mt-2 rounded-xl bg-river-soft px-3 py-2 text-sm text-river">Harga grosir berlaku: {rupiah(line.unit)}/kg</p>}
                {toWholesale > 0 && <p className="mt-2 text-sm text-mute">Tambah {kg(toWholesale)} lagi untuk harga grosir {rupiah(Number(p.wholesale_price_per_kg))}/kg.</p>}
              </section>

              <section>
                <p className="label">Pengolahan</p>
                <div className="space-y-2">
                  {options.map((o) => (
                    <label key={o.key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${processing === o.key ? 'border-river bg-river-soft' : 'border-line bg-card'}`}>
                      <input type="radio" name="processing" className="mt-1 accent-river" checked={processing === o.key} onChange={() => setProcessing(o.key)} />
                      <span><span className="block font-semibold">{PROCESSING_LABEL[o.key]}</span><span className="text-sm text-mute">{o.desc}</span></span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <p className="label">Pembayaran</p>
                <div className="grid grid-cols-2 gap-2">
                  {([['transfer', 'Transfer / QRIS'], ['cod', 'COD (Bayar di Tempat)']] as const).map(([k, l]) => (
                    <button type="button" key={k} onClick={() => setPayment(k)} aria-pressed={payment === k}
                      className={`min-h-[48px] rounded-xl border px-3 text-sm font-semibold ${payment === k ? 'border-river bg-river text-white' : 'border-line bg-card'}`}>{l}</button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div><label className="label" htmlFor="phone">Nomor WhatsApp</label>
                  <input id="phone" type="tel" inputMode="tel" className="input" required placeholder="0812 3456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><label className="label" htmlFor="address">Alamat Pengiriman</label>
                  <textarea id="address" className="input min-h-[88px] py-2" required placeholder="Jalan, nomor, RT/RW, kelurahan, kota" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                <div><label className="label" htmlFor="notes">Catatan (opsional)</label>
                  <input id="notes" className="input" placeholder="Mis. antar sebelum jam 10 pagi" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              </section>
            </div>

            <div className="border-t border-line bg-card px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <dl className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-mute">{kg(valid ? weight : 0)} × {rupiah(line.unit)}</dt><dd>{rupiah(Math.round(line.unit * (valid ? weight : 0)))}</dd></div>
                {line.cleaning > 0 && <div className="flex justify-between"><dt className="text-mute">Biaya bersihkan</dt><dd>{rupiah(line.cleaning)}</dd></div>}
                <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{rupiah(line.subtotal)}</dd></div>
              </dl>
              {error && <p role="alert" className="mb-3 rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
              <button className="btn-primary w-full" disabled={pending || !valid}>{pending ? 'Memproses pesanan…' : 'Buat Pesanan'}</button>
              <p className="mt-2 text-center text-xs text-mute">Harga final dihitung ulang oleh server saat pesanan dibuat.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
