'use client'

import { createClient } from "@/lib/supabase/client";
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { adminCancelOrderAction, advanceOrderAction, verifyPaidAction } from '@/app/actions/admin'
import { kg, ORDER_BADGE, ORDER_STATUS_LABEL, PAYMENT_BADGE, PAYMENT_STATUS_LABEL, PROCESSING_LABEL, rupiah, tanggalWaktu } from '@/lib/format'
import type { Order, OrderStatus } from '@/lib/types'

const ADVANCE_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Terima & Siapkan', preparing: 'Kirim Pesanan', delivering: 'Selesaikan Pesanan',
}

export default function AdminOrderCard({ order: o, proofUrl }: { order: Order & { profiles: { full_name: string; phone: string | null } | null }; proofUrl: string | null }) {
  const router = useRouter();
  const onCancelOrder = async (orderId: string) => {
    if (!window.confirm("Yakin ingin membatalkan pesanan ini?")) return;
    try {
      const { error } = await createClient()
        .from("orders")
        .update({ order_status: "cancelled" })
        .eq("id", orderId);
      if (error) {
        alert("Gagal membatalkan pesanan: " + error.message);
        return;
      }
      alert("Pesanan berhasil dibatalkan.");
      if (typeof router !== "undefined") router.refresh();
      else window.location.reload();
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || "unknown"));
    }
  };

  const [showProof, setShowProof] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<{ error?: string } | void>) => start(async () => { setError(''); const r = await fn(); if (r && r.error) setError(r.error) })
  const wa = o.profiles?.phone ? 'https://wa.me/' + o.profiles.phone.replace(/\D/g, '').replace(/^0/, '62') : null
  const open = o.order_status !== 'cancelled' && o.order_status !== 'completed'

  return (
    <li className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[17px] font-bold">{o.invoice_code}</p>
          <p className="text-sm text-mute">{tanggalWaktu(o.created_at)}</p>
        </div>
        <p className="font-bold">{rupiah(o.total_amount)}</p>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className={`badge ${ORDER_BADGE[o.order_status]}`}>{ORDER_STATUS_LABEL[o.order_status]}</span>
        <span className="badge bg-paper text-ink">{o.payment_method === 'transfer' ? 'Transfer / QRIS' : 'COD'}</span>
        <span className={`badge ${PAYMENT_BADGE[o.payment_status]}`}>{PAYMENT_STATUS_LABEL[o.payment_status]}</span>
      </div>

      <ul className="mt-3 text-sm">
        {o.order_items.map((it) => <li key={it.id}><b>{it.products?.name}</b> · {kg(it.weight_kg)} · {PROCESSING_LABEL[it.processing_option]}</li>)}
      </ul>
      <div className="mt-2 text-sm text-mute">
        <p>{o.profiles?.full_name}{wa && <> · <a href={wa} target="_blank" rel="noreferrer" className="font-semibold text-river nav-tap-btn transition duration-150">WhatsApp {o.profiles?.phone}</a></>}</p>
        <p className="whitespace-pre-line">{o.delivery_address}</p>
        {o.delivery_notes && <p>Catatan: {o.delivery_notes}</p>}
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {proofUrl && <button className="btn-outline nav-tap-btn transition duration-150" onClick={() => setShowProof(true)}>Lihat Bukti Bayar</button>}
        {o.payment_method === 'transfer' && o.payment_status !== 'paid' && o.order_status !== 'cancelled' && (
          <button className="btn-outline nav-tap-btn transition duration-150" disabled={pending || o.payment_status !== 'verifying'} title={o.payment_status !== 'verifying' ? 'Menunggu bukti bayar dari pembeli' : undefined}
            onClick={() => run(() => verifyPaidAction(o.id))}>Verifikasi Lunas</button>
        )}
        {ADVANCE_LABEL[o.order_status] && (
          <button className="btn-primary nav-tap-btn transition duration-150" disabled={pending} onClick={() => run(() => advanceOrderAction(o.id))}>{ADVANCE_LABEL[o.order_status]}</button>
        )}
        {open && (
          <button className="btn-danger ml-auto nav-tap-btn transition duration-150" disabled={pending}
            onClick={() => { if (confirm(`Batalkan pesanan ${o.invoice_code}? Stok akan dikembalikan.`)) run(() => adminCancelOrderAction(o.id)) }}>Batalkan Pesanan</button>
        )}
      </div>

      {showProof && proofUrl && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" onClick={() => setShowProof(false)}>
          <div role="dialog" aria-modal="true" aria-label="Bukti pembayaran" className="max-h-full w-full max-w-md overflow-auto rounded-2xl bg-paper p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofUrl} alt={`Bukti pembayaran ${o.invoice_code}`} className="w-full rounded-xl border border-line" />
            <p className="mt-3 text-sm">Nominal pesanan: <b>{rupiah(o.total_amount)}</b></p>
            <div className="mt-3 flex gap-2">
              {o.payment_status !== 'paid' && <button className="btn-primary flex-1 nav-tap-btn transition duration-150" disabled={pending} onClick={() => { run(() => verifyPaidAction(o.id)); setShowProof(false) }}>Verifikasi Lunas</button>}
              <button className="btn-outline flex-1 nav-tap-btn transition duration-150" onClick={() => setShowProof(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
