import { createClient } from '@/lib/supabase/server'
import { kg, PROCESSING_LABEL, rupiah } from '@/lib/format'
import type { ProcessingOption } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const supabase = await createClient()
  const [{ data: stats }, { data: prep }] = await Promise.all([
    supabase.rpc('admin_stats').single<{ revenue_paid: number; active_orders: number; customers: number }>(),
    supabase.rpc('field_prep_summary'),
  ])
  const rows = (prep ?? []) as { product_name: string; processing_option: ProcessingOption; total_kg: number }[]
  const totalkg = rows.reduce((s, r) => s + Number(r.total_kg), 0)

  const cards = [
    { label: 'Total Omzet Lunas', value: rupiah(stats?.revenue_paid ?? 0) },
    { label: 'Pesanan Aktif', value: String(stats?.active_orders ?? 0) },
    { label: 'Total Pelanggan', value: String(stats?.customers ?? 0) },
  ]

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Ringkasan</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-4"><p className="text-sm text-mute">{c.label}</p><p className="mt-1 font-display text-2xl font-extrabold">{c.value}</p></div>
        ))}
      </div>

      <section className="card mt-6 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Rekap Persiapan Lapangan Hari Ini</h2>
          {rows.length > 0 && <p className="text-sm text-mute">Total {kg(totalkg)}</p>}
        </div>
        <p className="mb-3 text-sm text-mute">Jumlah yang perlu dipanen dan diolah dari pesanan berstatus Menunggu Konfirmasi dan Disiapkan.</p>
        {rows.length === 0 ? (
          <p className="rounded-xl bg-paper px-4 py-6 text-center text-mute">Tidak ada pesanan yang perlu disiapkan.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.product_name + r.processing_option} className="flex items-center justify-between gap-3 py-3">
                <span className="font-semibold">{r.product_name} — {PROCESSING_LABEL[r.processing_option]}</span>
                <span className="font-display text-lg font-extrabold text-river">{kg(r.total_kg)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
