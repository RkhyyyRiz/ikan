const PAKASIR_BASE = 'https://app.pakasir.com/api'

export async function createPakasirQris(params: {
  orderId: string
  amount: number
}) {
  const project = process.env.PAKASIR_PROJECT
  const apiKey = process.env.PAKASIR_API_KEY
  if (!project || !apiKey) {
    throw new Error('PAKASIR_PROJECT atau PAKASIR_API_KEY belum diatur')
  }

  const res = await fetch(`${PAKASIR_BASE}/transactioncreate/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project,
      order_id: params.orderId,
      amount: Math.round(params.amount),
      api_key: apiKey,
    }),
  })

  const data = await res.json()
  const payment = data?.payment ?? data

  if (!res.ok || !payment?.payment_number) {
    throw new Error(data?.message || 'Gagal membuat QRIS Pakasir')
  }

  return {
    qrisString: String(payment.payment_number),
    gatewayRef: String(payment.order_id ?? params.orderId),
    totalPayment: Number(payment.total_payment ?? params.amount),
    expiresAt: payment.expired_at ? new Date(payment.expired_at).toISOString() : null,
  }
}

export async function verifyPakasirTransaction(params: {
  orderId: string
  amount: number
}) {
  const project = process.env.PAKASIR_PROJECT
  const apiKey = process.env.PAKASIR_API_KEY
  if (!project || !apiKey) return null

  const url = new URL(`${PAKASIR_BASE}/transactiondetail`)
  url.searchParams.set('project', project)
  url.searchParams.set('order_id', params.orderId)
  url.searchParams.set('amount', String(Math.round(params.amount)))
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  return data?.transaction ?? data
}
