"use client";

import { useState, useTransition } from 'react'
import { uploadProofAction } from '@/app/actions/orders'

export default function ProofUpload({ orderId, label = 'Kirim Bukti Pembayaran' }: { orderId: string; label?: string }) {
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError('')
    start(async () => {
      const res = await uploadProofAction(fd)
      if (res.error) setError(res.error)
    })
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <input type="hidden" name="order_id" value={orderId} />
      <div>
        <label htmlFor="proof" className="label">Foto bukti transfer / QRIS</label>
        <input id="proof" name="proof" type="file" accept="image/jpeg,image/png,image/webp" required className="input !py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-river-soft file:px-3 file:py-1.5 file:font-semibold file:text-river" />
      </div>
      {error && <p role="alert" className="rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? 'Mengunggah…' : label}</button>
    </form>
  )
}
