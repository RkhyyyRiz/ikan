import Link from 'next/link'
import AdminOrderCard from '@/components/AdminOrderCard'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { ORDER_STATUS_LABEL } from '@/lib/format'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pesanan' }

type AdminOrder = Order & { profiles: { full_name: string; phone: string | null } | null }
const STATUSES = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'] as const

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; method?: string }> }) {
  const sp = await searchParams
  const status = STATUSES.find((s) => s === sp.status)
  const method = sp.method === 'transfer' || sp.method === 'cod' ? sp.method : undefined

  const supabase = await createClient()
  let q = supabase.from('orders').select('*, profiles(full_name, phone), order_items(*, products(name))').order('created_at', { ascending: false }).limit(100)
  if (status) q = q.eq('order_status', status)
  if (method) q = q.eq('payment_method', method)
  const { data } = await q
  const orders = (data ?? []) as unknown as AdminOrder[]

  // Tautan sementara untuk bukti bayar (layout /admin sudah memastikan role admin)
  const proofs: Record<string, string> = {}
  const withProof = orders.filter((o) => o.payment_proof_url)
  if (withProof.length) {
    const svc = createServiceClient()
    const { data: signed } = await svc.storage.from('payment-proofs').createSignedUrls(withProof.map((o) => o.payment_proof_url!), 3600)
    signed?.forEach((s, i) => { if (s.signedUrl) proofs[withProof[i].id] = s.signedUrl })
  }

  const href = (s?: string, m?: string) => {
    const p = new URLSearchParams()
    if (s) p.set('status', s)
    if (m) p.set('method', m)
    return `/admin/orders${p.size ? `?${p}` : ''}`
  }
  const chip = (on: boolean) => `min-h-[40px] shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${on ? 'border-river bg-river text-white' : 'border-line bg-card'}`

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Pesanan</h1>
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        <Link href={href(undefined, method)} className={chip(!status)}>Semua status</Link>
        {STATUSES.map((s) => <Link key={s} href={href(s, method)} className={chip(status === s)}>{ORDER_STATUS_LABEL[s]}</Link>)}
      </div>
      <div className="mb-5 flex gap-2">
        <Link href={href(status)} className={chip(!method)}>Semua pembayaran</Link>
        <Link href={href(status, 'transfer')} className={chip(method === 'transfer')}>Transfer</Link>
        <Link href={href(status, 'cod')} className={chip(method === 'cod')}>COD</Link>
      </div>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-mute">Tidak ada pesanan dengan filter ini.</div>
      ) : (
        <ul className="space-y-3">{orders.map((o) => <AdminOrderCard key={o.id} order={o} proofUrl={proofs[o.id] ?? null} />)}</ul>
      )}
    </>
  )
}
