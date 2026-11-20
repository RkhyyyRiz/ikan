import type { OrderStatus, PaymentStatus, ProcessingOption, Product } from './types'

export const rupiah = (n: number) => `Rp ${Math.round(Number(n)).toLocaleString('id-ID')}`
export const kg = (n: number | string) => `${Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg`
export const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
export const tanggalWaktu = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Pontianak' })

export const PROCESSING_LABEL: Record<ProcessingOption, string> = {
  hidup: 'Hidup', segar_es: 'Segar (Es)', bersih_siap_masak: 'Bersih Siap Masak',
}
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi', preparing: 'Disiapkan / Dibersihkan', delivering: 'Dalam Pengantaran',
  completed: 'Selesai', cancelled: 'Dibatalkan',
}
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Belum Dibayar', verifying: 'Menunggu Verifikasi', paid: 'Lunas',
}
export const ORDER_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-kunyit-soft text-kunyit', preparing: 'bg-river-soft text-river', delivering: 'bg-river-soft text-river',
  completed: 'bg-river text-white', cancelled: 'bg-merah-soft text-merah',
}
export const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  unpaid: 'bg-merah-soft text-merah', verifying: 'bg-kunyit-soft text-kunyit', paid: 'bg-river-soft text-river',
}

// Harga yang sama persis dengan fungsi SQL create_fish_order (hanya untuk pratinjau di UI).
export function calcLine(p: Pick<Product, 'price_per_kg' | 'wholesale_min_kg' | 'wholesale_price_per_kg' | 'cleaning_fee_per_kg'>, weight: number, opt: ProcessingOption) {
  const wholesale = p.wholesale_price_per_kg != null && weight >= Number(p.wholesale_min_kg)
  const unit = wholesale ? Number(p.wholesale_price_per_kg) : Number(p.price_per_kg)
  const cleaning = opt === 'bersih_siap_masak' ? Math.round(Number(p.cleaning_fee_per_kg) * weight) : 0
  return { wholesale, unit, cleaning, subtotal: Math.round(unit * weight) + cleaning }
}
