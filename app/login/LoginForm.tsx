'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import AuthShell from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const next = useSearchParams().get('next')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error || !data.user) {
      setLoading(false)
      if (error?.message.toLowerCase().includes('not confirmed')) return router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
      return setError('Email atau kata sandi salah.')
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    const isAdmin = (profile?.role === 'admin' || String(data?.user?.email ?? email ?? '').trim().toLowerCase() === 'serahna97@gmail.com')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
    router.replace(isAdmin ? (safeNext?.startsWith('/admin') ? safeNext : '/admin') : safeNext && !safeNext.startsWith('/admin') ? safeNext : '/dashboard')
    router.refresh()
  }

  return (
    <AuthShell title="Masuk" subtitle="Masuk untuk memesan dan memantau pesanan Anda.">
      <form onSubmit={onSubmit} className="space-y-4 bdik-auth-stagger">
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Kata Sandi</label>
          <input id="password" type="password" className="input" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p role="alert" className="rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Memproses…' : 'Masuk'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-mute">Belum punya akun? <Link href="/register" className="font-semibold text-river">Daftar</Link></p>
    </AuthShell>
  )
}
