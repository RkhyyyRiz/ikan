export type Role = 'user' | 'admin'
export type ProcessingOption = 'hidup' | 'segar_es' | 'bersih_siap_masak'
export type PaymentMethod = 'transfer' | 'cod'
export type PaymentStatus = 'unpaid' | 'verifying' | 'paid'
export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled'

export interface Profile { id: string; full_name: string; email: string; phone: string | null; address: string | null; role: Role }

export interface Product {
  id: string; name: string; size_spec: string; price_per_kg: number
  wholesale_min_kg: number; wholesale_price_per_kg: number | null; cleaning_fee_per_kg: number
  stock_kg: number; availability_type: 'ready' | 'preorder'; harvest_date: string | null
  image_url: string | null; is_active: boolean
}

export interface OrderItem {
  id: string; product_id: string; weight_kg: number; processing_option: ProcessingOption
  unit_price_applied: number; cleaning_fee_applied: number; subtotal: number
  products: { name: string } | null
}

export interface Order {
  qris_string?: string | null
  gateway_ref?: string | null
  qris_total?: number | null
  qris_expires_at?: string | null
  id: string; invoice_code: string; user_id: string; total_amount: number
  payment_method: PaymentMethod; payment_status: PaymentStatus; payment_proof_url: string | null
  order_status: OrderStatus; delivery_address: string; delivery_notes: string | null; created_at: string
  order_items: OrderItem[]
}
