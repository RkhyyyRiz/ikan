import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPakasirTransaction } from '@/lib/pakasir'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, amount, project, status } = body

    if (!order_id || !amount || project !== process.env.PAKASIR_PROJECT) {
      return NextResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    if (status !== 'completed') {
      return NextResponse.json({ ok: true })
    }

    const verified = await verifyPakasirTransaction({
      orderId: String(order_id),
      amount: Number(amount),
    })

    if (verified?.status !== 'completed') {
      return NextResponse.json({ message: 'Transaksi belum terverifikasi' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('gateway_ref', String(order_id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook Pakasir error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
