'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import AuthShell from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function VerifyForm() {
  const router = useRouter()
  const email = useSearchParams().get('email') ?? ''
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const setAt = (i: number, v: string) => setDigits((d) => d.map((x, j) => (j === i ? v : x)))

  function onChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, '')
    if (v.length > 1) { // tempel kode penuh
      const next = v.slice(0, 6).padEnd(6, ' ').split('').map((c) => c.trim())
      setDigits(next); refs.current[Math.min(v.length, 5)]?.focus(); return
    }
    setAt(i, v)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  async function verify(e?: React.FormEvent) {
    e?.preventDefault()
    const token = digits.join('')
    if (token.length !== 6) return setError('Masukkan 6 digit kode.')
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (error || !data.user) { setLoading(false); return setError('Kode salah atau sudah kedaluwarsa.') }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    router.replace((profile?.role === 'admin' || String(data?.user?.email ?? email ?? '').trim().toLowerCase() === 'serahna97@gmail.com') ? '/admin' : '/dashboard')
    router.refresh()
  }

  async function resend() {
    setError(''); setInfo('')
    const { error } = await createClient().auth.resend({ type: 'signup', email })
    if (error) return setError('Gagal mengirim ulang: ' + error.message)
    setInfo('Kode baru sudah dikirim.'); setCooldown(60)
  }

  if (!email) return (
    <AuthShell title="Email tidak ditemukan"><Link href="/register" className="btn-primary w-full">Kembali ke pendaftaran</Link></AuthShell>
  )

  return (
    <AuthShell title="Masukkan kode verifikasi" subtitle={`Kami mengirim kode 6 digit ke ${email}.`}>
      <form onSubmit={verify} className="space-y-5">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1}`} maxLength={6}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus() }}
              className="h-14 w-full min-w-0 rounded-xl border border-line bg-white text-center font-display text-2xl font-bold focus:border-river focus:outline-none" />
          ))}
        </div>
        {error && <p role="alert" className="rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
        {info && <p className="rounded-xl bg-river-soft px-3 py-2 text-sm text-river">{info}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Memverifikasi…' : 'Verifikasi'}</button>
        <button type="button" onClick={resend} disabled={cooldown > 0} className="btn-outline w-full">
          {cooldown > 0 ? `Kirim Ulang Kode (${cooldown} dtk)` : 'Kirim Ulang Kode'}
        </button>
      </form>
    </AuthShell>
  )
}
