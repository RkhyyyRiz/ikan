'use server'

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/lib/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Belum masuk.')
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdminEmail = String((user as any)?.email ?? "").trim().toLowerCase() === "serahna97@gmail.com";
  const role = data?.role ?? (user as any)?.user_metadata?.role ?? (isAdminEmail ? "admin" : null);
  if (role !== "admin") throw new Error("Khusus admin.")
  const supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
const refresh = () => { revalidatePath('/admin', 'layout'); revalidatePath('/') }

export async function saveProductAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const id = String(formData.get('id') || '')
  const num = (k: string) => Number(String(formData.get(k) || '0').replace(',', '.'))
  const name = String(formData.get('name') || '').trim()
  const sizeSpec = String(formData.get('size_spec') || '').trim()
  const availability = String(formData.get('availability_type')) === 'preorder' ? 'preorder' : 'ready'
  const harvest = String(formData.get('harvest_date') || '')
  const wholesale = String(formData.get('wholesale_price_per_kg') || '').trim()

  if (!name || !sizeSpec) return { error: 'Nama dan ukuran wajib diisi.' }
  if (!(num('price_per_kg') > 0)) return { error: 'Harga eceran harus lebih dari 0.' }
  if (availability === 'preorder' && !harvest) return { error: 'Isi tanggal panen untuk Pre-Order.' }
  if (wholesale && Number(wholesale) >= num('price_per_kg')) return { error: 'Harga grosir harus lebih murah dari harga eceran.' }

  let imageUrl = String(formData.get('existing_image_url') || '') || null
  const file = formData.get('image') as File | null
  if (file && file.size > 0) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { error: 'Foto harus JPG, PNG, atau WebP.' }
    if (file.size > 5 * 1024 * 1024) return { error: 'Ukuran foto maksimal 5 MB.' }
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('fish-photos').upload(path, file, { contentType: file.type })
    if (upErr) return { error: 'Unggah foto gagal: ' + upErr.message }
    imageUrl = supabase.storage.from('fish-photos').getPublicUrl(path).data.publicUrl
  }

  const row = {
    name, size_spec: sizeSpec, price_per_kg: Math.round(num('price_per_kg')),
    wholesale_min_kg: num('wholesale_min_kg') || 5,
    wholesale_price_per_kg: wholesale ? Math.round(Number(wholesale)) : null,
    cleaning_fee_per_kg: Math.round(num('cleaning_fee_per_kg')),
    stock_kg: num('stock_kg'), availability_type: availability,
    harvest_date: availability === 'preorder' ? harvest : null,
    image_url: imageUrl, is_active: formData.get('is_active') === 'on',
  }
  const { error } = id ? await supabase.from('products').update(row).eq('id', id) : await supabase.from('products').insert(row)
  if (error) return { error: error.message }
  refresh()
  return {}
}

export async function updateStockAction(id: string, stock: number): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  if (!(stock >= 0)) return { error: 'Stok tidak boleh negatif.' }
  const { error } = await supabase.from('products').update({ stock_kg: stock }).eq('id', id)
  if (error) return { error: error.message }
  refresh()
  return {}
}

export async function toggleActiveAction(id: string, active: boolean) {
  const supabase = await requireAdmin()
  await supabase.from('products').update({ is_active: active }).eq('id', id)
  refresh()
}

export async function verifyPaidAction(orderId: string) {
  const supabase = await requireAdmin()
  await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId)
  refresh()
}

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { pending: 'preparing', preparing: 'delivering', delivering: 'completed' }

export async function advanceOrderAction(orderId: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { data: o } = await supabase.from('orders').select('order_status, payment_method').eq('id', orderId).single()
  const next = o ? NEXT[o.order_status as OrderStatus] : undefined
  if (!o || !next) return { error: 'Status tidak dapat dilanjutkan.' }
  const patch: Record<string, string> = { order_status: next }
  if (next === 'completed' && o.payment_method === 'cod') patch.payment_status = 'paid'
  const { error } = await supabase.from('orders').update(patch).eq('id', orderId).eq('order_status', o.order_status)
  if (error) return { error: error.message }
  refresh()
  return {}
}

export async function adminCancelOrderAction(orderId: string): Promise<{ error?: string }> {
  const supabase = await requireAdmin()
  const { error } = await supabase.rpc('cancel_fish_order', { p_order_id: orderId })
  if (error) return { error: error.message }
  refresh()
  return {}
}
