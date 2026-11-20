import Link from 'next/link'
import { reorderAction } from '@/app/actions/orders'
import { createClient } from '@/lib/supabase/server'
import { kg, ORDER_BADGE, ORDER_STATUS_LABEL, PAYMENT_BADGE, PAYMENT_STATUS_LABEL, PROCESSING_LABEL, rupiah, tanggal } from '@/lib/format'
import type { Order } from '@/lib/types'

export const metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    supabase.from('orders').select('*, order_items(*, products(name))').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])
  const orders = (data ?? []) as Order[]

  return (
    <>
      <h1 className="text-2xl font-bold">Halo, {profile?.full_name?.split(' ')[0] ?? 'Pelanggan'}</h1>
      <p className="mb-5 text-mute">Riwayat pesanan Anda.</p>
      {error && <p role="alert" className="mb-4 rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-mute">Belum ada pesanan.</p>
          <Link href="/" className="btn-primary mt-4">Lihat ikan yang tersedia</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/dashboard/orders/${o.id}`} className="font-display text-[17px] font-bold hover:text-river">{o.invoice_code}</Link>
                  <p className="text-sm text-mute">{tanggal(o.created_at)}</p>
                </div>
                <p className="font-bold">{rupiah(o.total_amount)}</p>
              </div>
              <ul className="mt-2 text-sm">
                {o.order_items.map((it) => (
                  <li key={it.id}>{it.products?.name} · {kg(it.weight_kg)} · {PROCESSING_LABEL[it.processing_option]}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`badge ${ORDER_BADGE[o.order_status]}`}>{ORDER_STATUS_LABEL[o.order_status]}</span>
                {o.order_status !== 'cancelled' && <span className={`badge ${PAYMENT_BADGE[o.payment_status]}`}>{PAYMENT_STATUS_LABEL[o.payment_status]}</span>}
                <form action={reorderAction} className="ml-auto">
                  <input type="hidden" name="order_id" value={o.id} />
                  <button className="btn-outline !min-h-[40px]">Pesan Ulang</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Step Progres Pesanan (Warna Hijau-Mint) */}
      <div className="mb-5 rounded-[24px] border border-line bg-[#F6FBF8] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#124E3B]">Alur Pesanan Ikan</span>
          <Link href="/" className="text-xs font-bold text-[#15803D] hover:underline">+ Pesan Lagi</Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
          <div className="rounded-xl bg-[#EAF6F0] px-2 py-2 text-[#124E3B]">1. Dibuat</div>
          <div className="rounded-xl bg-[#EAF6F0] px-2 py-2 text-[#124E3B]">2. Bayar QRIS</div>
          <div className="rounded-xl bg-[#EAF6F0] px-2 py-2 text-[#124E3B]">3. Disiapkan</div>
          <div className="rounded-xl bg-[#124E3B] px-2 py-2 text-white">4. Dikirim</div>
        </div>
      </div>
    </>
  )
}
