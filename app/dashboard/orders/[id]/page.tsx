import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cancelOwnOrderAction } from '@/app/actions/orders'
import ProofUpload from '@/components/ProofUpload'
import StatusStepper from '@/components/StatusStepper'
import { createClient } from '@/lib/supabase/server'
import { kg, ORDER_BADGE, ORDER_STATUS_LABEL, PAYMENT_BADGE, PAYMENT_STATUS_LABEL, PROCESSING_LABEL, rupiah, tanggalWaktu } from '@/lib/format'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Detail Pesanan' }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('orders').select('*, order_items(*, products(name))').eq('id', id).eq('user_id', user!.id).single()
  if (!data) notFound()
  const o = data as Order

  let proofUrl: string | null = null
  if (o.payment_proof_url) {
    const { data: signed } = await supabase.storage.from('payment-proofs').createSignedUrl(o.payment_proof_url, 3600)
    proofUrl = signed?.signedUrl ?? null
  }
  const qris = process.env.NEXT_PUBLIC_QRIS_IMAGE_URL
  const accountInfo = (process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_INFO ?? '').split(/\\n|\n/)
  const active = o.order_status !== 'cancelled'

  return (
    <>
      <Link href="/dashboard" className="text-sm font-semibold text-river">← Semua pesanan</Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{o.invoice_code}</h1>
        <span className={`badge ${ORDER_BADGE[o.order_status]}`}>{ORDER_STATUS_LABEL[o.order_status]}</span>
      </div>
      <p className="mb-5 text-sm text-mute">Dipesan {tanggalWaktu(o.created_at)}</p>

      <section className="card mb-4 p-4"><StatusStepper status={o.order_status} /></section>

      <section className="card mb-4 p-4">
        <h2 className="mb-3 font-bold">Rincian pesanan</h2>
        <ul className="divide-y divide-line">
          {o.order_items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{it.products?.name}</p>
                <p className="text-mute">{kg(it.weight_kg)} × {rupiah(it.unit_price_applied)} · {PROCESSING_LABEL[it.processing_option]}</p>
                {it.cleaning_fee_applied > 0 && <p className="text-mute">Biaya bersihkan {rupiah(it.cleaning_fee_applied)}</p>}
              </div>
              <p className="font-semibold">{rupiah(it.subtotal)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{rupiah(o.total_amount)}</span></p>
      </section>

      <section className="card mb-4 p-4 text-sm">
        <h2 className="mb-2 font-bold">Pengiriman</h2>
        <p className="whitespace-pre-line">{o.delivery_address}</p>
        {o.delivery_notes && <p className="mt-1 text-mute">Catatan: {o.delivery_notes}</p>}
      </section>

      {active && (
        <section className="card mb-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Pembayaran · {o.payment_method === 'transfer' ? 'Transfer / QRIS' : 'COD'}</h2>
            <span className={`badge ${PAYMENT_BADGE[o.payment_status]}`}>{PAYMENT_STATUS_LABEL[o.payment_status]}</span>
          </div>

          {o.payment_method === 'cod' ? (
            <p className="mt-3 rounded-xl bg-kunyit-soft px-3 py-3 text-sm text-kunyit">
              Siapkan uang pas sebesar <b>{rupiah(o.total_amount)}</b>. Bayar tunai kepada kurir saat ikan diterima.
            </p>
          ) : o.payment_status === 'paid' ? (
            <p className="mt-3 rounded-xl bg-river-soft px-3 py-3 text-sm text-river">Pembayaran sudah diverifikasi. Terima kasih!</p>
          ) : (
            <div className="mt-3">
              {o.payment_status === 'verifying' && <p className="mb-3 rounded-xl bg-kunyit-soft px-3 py-3 text-sm text-kunyit">Bukti pembayaran sedang diperiksa admin. Anda masih bisa mengirim ulang jika salah foto.</p>}
              <p className="text-sm">Transfer tepat <b>{rupiah(o.total_amount)}</b> lewat QRIS atau rekening berikut:</p>
              {qris && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qris} alt="Kode QRIS pembayaran" className="mx-auto my-3 h-56 w-56 rounded-xl border border-line object-contain" />
              )}
              {accountInfo[0] && <p className="rounded-xl bg-paper px-3 py-3 text-sm font-semibold">{accountInfo.map((l, i) => <span key={i} className="block">{l}</span>)}</p>}
              {proofUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proofUrl} alt="Bukti pembayaran yang Anda kirim" className="mt-3 max-h-48 rounded-xl border border-line" />
              )}
              <ProofUpload orderId={o.id} label={o.payment_status === 'verifying' ? 'Kirim Ulang Bukti' : 'Kirim Bukti Pembayaran'} />
            </div>
          )}
        </section>
      )}

      {o.order_status === 'pending' && o.payment_status === 'unpaid' && (
        <form action={cancelOwnOrderAction}>
          <input type="hidden" name="order_id" value={o.id} />
          <button className="btn-danger w-full">Batalkan Pesanan</button>
        </form>
      )}
    </>
  )
}
