'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AuthShell from '@/components/AuthShell'
import { createClient } from '@/lib/supabase/client'
import { siteUrl } from '@/lib/site'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Kata sandi minimal 8 karakter.')
    setLoading(true)
    const email = form.email.trim().toLowerCase()
    const { data, error } = await createClient().auth.signUp({
      email, password: form.password,
      options: { data: { full_name: form.name.trim() }, emailRedirectTo: siteUrl() },
    })
    setLoading(false)
    if (error) return setError(error.message.includes('registered') ? 'Email sudah terdaftar. Silakan masuk.' : 'Pendaftaran gagal: ' + error.message)
    // Email sudah terdaftar & terverifikasi: Supabase mengembalikan identities kosong
    if (data.user && data.user.identities?.length === 0) return setError('Email sudah terdaftar. Silakan masuk.')
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthShell title="Buat akun" subtitle="Daftar untuk memesan ikan segar. Kode verifikasi 6 digit dikirim ke email Anda.">
      <form onSubmit={onSubmit} className="space-y-4 bdik-auth-stagger">
        <div><label className="label" htmlFor="name">Nama Lengkap</label>
          <input id="name" className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="password">Kata Sandi</label>
          <input id="password" type="password" className="input" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="mt-1 text-xs text-mute">Minimal 8 karakter.</p></div>
        {error && <p role="alert" className="rounded-xl bg-merah-soft px-3 py-2 text-sm text-merah">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Mengirim kode…' : 'Daftar'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-mute">Sudah punya akun? <Link href="/login" className="font-semibold text-river">Masuk</Link></p>
    </AuthShell>
  )
}
