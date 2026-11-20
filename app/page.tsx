import Link from 'next/link'
import Logo from '@/components/Logo'
import Storefront from '@/components/Storefront'
import { createClient } from '@/lib/supabase/server'
import type { Product, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: products }, { data: profile }] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    user ? supabase.from('profiles').select('id,full_name,email,phone,address,role').eq('id', user.id).single() : Promise.resolve({ data: null }),
  ])
  const me = profile as Profile | null

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          {user ? (
            <Link href={me?.role === 'admin' ? '/admin' : '/dashboard'} className="btn-outline !min-h-[40px]">{me?.role === 'admin' ? 'Panel Admin' : 'Dashboard'}</Link>
          ) : (
            <Link href="/login" className="btn-primary !min-h-[40px]">Masuk</Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <section className="mb-6">
          <h1 className="text-[28px] font-extrabold leading-tight sm:text-4xl">Ikan segar, langsung dari kolam Kalimantan Barat.</h1>
          <p className="mt-2 max-w-xl text-[15px] text-mute">Pesan per kilo, pilih hidup, segar es, atau sudah dibersihkan. Beli banyak untuk warung, harga grosir otomatis.</p>
        </section>
        <Storefront products={(products ?? []) as Product[]} profile={me} loggedIn={!!user} />
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-mute">© {new Date().getFullYear()} Budi Daya Ikan Kalbar</footer>
    </>
  )
}
