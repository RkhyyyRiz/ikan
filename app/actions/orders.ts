'use server'

import { createPakasirQris } from '@/lib/pakasir'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProcessingOption, PaymentMethod } from '@/lib/types'

export interface OrderInput {
  productId: string; weightKg: number; processing: ProcessingOption; payment: PaymentMethod
  phone: string; address: string; notes: string
}

const cleanMsg = (m: string) => m.replace(/^.*?(?=[A-Z])/, '') || m

export async function createOrderAction(input: OrderInput): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/')

  const phone = input.phone.trim()
  const address = input.address.trim()
  if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(phone.replace(/[\s-]/g, ''))) return { error: 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.' }
  if (address.length < 8) return { error: 'Alamat pengiriman wajib diisi lengkap.' }

  const { data: id, error } = await supabase.rpc('create_fish_order', {
    p_product_id: input.productId, p_weight_kg: input.weightKg, p_processing_option: input.processing,
    p_payment_method: input.payment, p_delivery_address: address, p_delivery_notes: input.notes.trim() || null,
  })
  if (error || !id) return { error: cleanMsg(error?.message ?? 'Pesanan gagal dibuat. Coba lagi.') }

  // Generate QRIS dinamis otomatis lewat Pakasir jika metode pembayaran non-COD
  try {
    const { data: createdOrder } = await supabase
      .from('orders')
      .select('invoice_code, total_amount, payment_method')
      .eq('id', id)
      .single()

    if (createdOrder && createdOrder.payment_method !== 'cod') {
      const qris = await createPakasirQris({
        orderId: createdOrder.invoice_code,
        amount: Number(createdOrder.total_amount),
      })
      await supabase
        .from('orders')
        .update({
          qris_string: qris.qrisString,
          gateway_ref: qris.gatewayRef,
          qris_total: qris.totalPayment,
          qris_expires_at: qris.expiresAt,
        })
        .eq('id', id)
    }
  } catch (qrisErr) {
    console.error('Gagal generate QRIS Pakasir:', qrisErr)
  }

  // Simpan nomor & alamat ke profil hanya jika masih kosong
  const { data: profile } = await supabase.from('profiles').select('phone,address').eq('id', user.id).single()
  const patch: Record<string, string> = {}
  if (!profile?.phone) patch.phone = phone
  if (!profile?.address) patch.address = address
  if (Object.keys(patch).length) await supabase.from('profiles').update(patch).eq('id', user.id)

  revalidatePath('/')
  revalidatePath('/dashboard')
  redirect(`/dashboard/orders/${id}`)
}

// "Pesan Ulang": buat pesanan baru dengan item, pengolahan, dan alamat yang sama
export async function reorderAction(formData: FormData) {
  const orderId = String(formData.get('order_id'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: old } = await supabase.from('orders')
    .select('payment_method, delivery_address, delivery_notes, order_items(product_id, weight_kg, processing_option)')
    .eq('id', orderId).eq('user_id', user.id).single()
  const item = old?.order_items?.[0]
  if (!old || !item) redirect('/dashboard?error=Pesanan%20tidak%20ditemukan')

  const { data: id, error } = await supabase.rpc('create_fish_order', {
    p_product_id: item.product_id, p_weight_kg: item.weight_kg, p_processing_option: item.processing_option,
    p_payment_method: old.payment_method, p_delivery_address: old.delivery_address, p_delivery_notes: old.delivery_notes,
  })
  if (error || !id) redirect(`/dashboard?error=${encodeURIComponent(cleanMsg(error?.message ?? 'Gagal memesan ulang'))}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/orders/${id}`)
}

export async function uploadProofAction(formData: FormData): Promise<{ error?: string }> {
  const orderId = String(formData.get('order_id'))
  const file = formData.get('proof') as File | null
  if (!file || file.size === 0) return { error: 'Pilih foto bukti pembayaran terlebih dahulu.' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { error: 'Format harus JPG, PNG, atau WebP.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Ukuran foto maksimal 5 MB.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi berakhir. Silakan masuk lagi.' }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/${orderId}-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('payment-proofs').upload(path, file, { contentType: file.type })
  if (upErr) return { error: 'Unggah gagal. Coba lagi.' }

  const { error } = await supabase.rpc('submit_payment_proof', { p_order_id: orderId, p_path: path })
  if (error) return { error: cleanMsg(error.message) }
  revalidatePath(`/dashboard/orders/${orderId}`)
  return {}
}

export async function cancelOwnOrderAction(formData: FormData) {
  const orderId = String(formData.get('order_id'))
  const supabase = await createClient()
  await supabase.rpc('cancel_fish_order', { p_order_id: orderId })
  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard')
  revalidatePath('/')
}
