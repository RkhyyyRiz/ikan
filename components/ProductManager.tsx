'use client'

import { createClient } from "@/lib/supabase/client";

import { useState, useTransition } from 'react'
import { saveProductAction, toggleActiveAction, updateStockAction } from '@/app/actions/admin'
import { kg, rupiah, tanggal } from '@/lib/format'
import type { Product } from '@/lib/types'

function StockEditor({ p }: { p: Product }) {
  const [val, setVal] = useState(String(p.stock_kg))
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const dirty = Number(val.replace(',', '.')) !== Number(p.stock_kg)

  return (
    <div>
      <div className="flex items-center gap-2">
        <input aria-label={`Stok ${p.name} (kg)`} inputMode="decimal" value={val} onChange={(e) => { setVal(e.target.value); setMsg('') }} className="input !w-24 text-center" />
        <span className="text-sm text-mute">kg</span>
        <button disabled={!dirty || pending} className="btn-outline !min-h-[44px]" onClick={() => start(async () => { const r = await updateStockAction(p.id, Number(val.replace(',', '.'))); setMsg(r.error ?? 'Tersimpan') })}>
          {pending ? '…' : 'Simpan'}
        </button>
      </div>
      {msg && <p className={`mt-1 text-xs ${msg === 'Tersimpan' ? 'text-river' : 'text-merah'}`}>{msg}</p>}
    </div>
  )
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [error, setError] = useState('')
  const [type, setType] = useState<'ready' | 'preorder'>(product?.availability_type ?? 'ready')
  const [pending, start] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError('')
    start(async () => {
      const res = await saveProductAction(fd)
      if (res.error) setError(res.error); else onClose()
    })
  }

  const f = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} className="input" {...props} /></div>
  )

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 sm:items-center" onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="flex max-h-[94dvh] w-full max-w-lg flex-col rounded-t-2xl bg-paper sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{product ? 'Ubah Produk' : 'Tambah Produk'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="-mr-2 grid h-11 w-11 place-items-center text-2xl text-mute">×</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <input type="hidden" name="id" value={product?.id ?? ''} />
          <input type="hidden" name="existing_image_url" value={product?.image_url ?? ''} />
          {f('name', 'Nama Ikan', { required: true, defaultValue: product?.name, placeholder: 'Ikan Nila Merah' })}
          {f('size_spec', 'Ukuran', { required: true, defaultValue: product?.size_spec, placeholder: 'Isi 3-4 ekor/kg' })}
          <div className="grid grid-cols-2 gap-3">
            {f('price_per_kg', 'Harga Eceran /kg (Rp)', { required: true, type: 'number', min: 0, defaultValue: product?.price_per_kg })}
            {f('wholesale_price_per_kg', 'Harga Grosir /kg (Rp)', { type: 'number', min: 0, defaultValue: product?.wholesale_price_per_kg ?? '' })}
            {f('wholesale_min_kg', 'Minimal Grosir (kg)', { type: 'number', step: '0.5', min: 0.5, defaultValue: product?.wholesale_min_kg ?? 5 })}
            {f('cleaning_fee_per_kg', 'Biaya Bersihkan /kg (Rp)', { type: 'number', min: 0, defaultValue: product?.cleaning_fee_per_kg ?? 2000 })}
          </div>
          {f('stock_kg', 'Stok (kg)', { required: true, type: 'number', step: '0.5', min: 0, defaultValue: product?.stock_kg ?? 0 })}
          <div>
            <label className="label" htmlFor="availability_type">Ketersediaan</label>
            <select id="availability_type" name="availability_type" className="input" value={type} onChange={(e) => setType(e.target.value as 'ready' | 'preorder')}>
              <option value="ready">Ready (siap kirim)</option><option value="preorder">Pre-Order Panen</option>
            </select>
          </div>
          {type === 'preorder' && f('harvest_date', 'Tanggal Panen', { type: 'date', required: true, defaultValue: product?.harvest_date ?? '' })}
          <div>
            <label className="label" htmlFor="image">Foto Ikan</label>
            {product?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt="" className="mb-2 h-24 rounded-xl border border-line object-cover" />
            )}
            <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="input !py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-river-soft file:px-3 file:py-1.5 file:font-semibold file:text-river" />
          </div>
          <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="h-5 w-5 accent-river" /><span className="font-medium">Tampilkan di toko</span></label>
        </div>
        <div className="border-t border-line px-5 py-4">
          {error && <p role="alert" className="mb-3 rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
          <button className="btn-primary w-full" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan Produk'}</button>
        </div>
      </form>
    </div>
  )
}

export default function ProductManager({ products }: { products: Product[] }) {
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Hapus produk "${name}" secara permanen?`)) return;
    const { error } = await createClient().from("products").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus (produk mungkin sudah ada di riwayat pesanan). Cukup klik Nonaktifkan saja.");
      return;
    }
    window.location.reload();
  };

  const [editing, setEditing] = useState<Product | null | undefined>(undefined) // undefined = tertutup, null = baru
  const [, start] = useTransition()

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk Ikan</h1>
        <button className="btn-primary" onClick={() => setEditing(null)}>Tambah Produk</button>
      </div>
      {products.length === 0 ? (
        <div className="card p-8 text-center text-mute">Belum ada produk. Tambahkan ikan pertama Anda.</div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${p.is_active ? '' : 'opacity-70'}`}>
              {p.image_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.image_url} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                : <div className="h-20 w-28 shrink-0 rounded-lg bg-river-soft" />}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{p.name} <span className="font-normal text-mute">· {p.size_spec}</span></p>
                <p className="text-sm">{rupiah(p.price_per_kg)}/kg{p.wholesale_price_per_kg != null && <> · grosir ≥ {kg(p.wholesale_min_kg)}: {rupiah(p.wholesale_price_per_kg)}/kg</>}</p>
                <p className="text-sm text-mute">{p.availability_type === 'preorder' ? `Pre-Order, panen ${p.harvest_date ? tanggal(p.harvest_date) : '-'}` : 'Ready'} · bersihkan {rupiah(p.cleaning_fee_per_kg)}/kg</p>
              </div>
              <StockEditor key={p.id + p.stock_kg} p={p} />
              <div className="flex gap-2">
                <button className="btn-outline" onClick={() => setEditing(p)}>Ubah</button>
                <button className="btn-outline" onClick={() => start(() => toggleActiveAction(p.id, !p.is_active))}>{p.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing !== undefined && <ProductForm product={editing} onClose={() => setEditing(undefined)} />}
    </>
  )
}
