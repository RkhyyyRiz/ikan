import ProductManager from '@/components/ProductManager'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Produk Ikan' }

export default async function AdminProducts() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return <ProductManager products={(data ?? []) as Product[]} />
}
