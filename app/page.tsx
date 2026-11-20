import Link from 'next/link'
import Logo from '@/components/Logo'
import Storefront from '@/components/Storefront'
import { createClient } from '@/lib/supabase/server'
import type { Product, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let user: any = null
  let products: any[] = []
  let me: Profile | null = null

  try {
    const supabase = await createClient()
    const authRes = await supabase.auth.getUser()
    user = authRes?.data?.user ?? null

    const [{ data: prodData }, { data: profileData }] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      user
        ? supabase.from('profiles').select('id,full_name,email,phone,address,role').eq('id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    products = prodData ?? []
    me = (profileData as Profile | null) ?? null
  } catch (err) {
    console.error('Home page fetch error:', err)
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 pb-2 pt-4 sm:max-w-3xl">
          <div className="h-10 w-10" aria-hidden="true" />

          <div className="text-center">
            <span className="font-display text-sm font-extrabold tracking-tight text-ink">
              Budi Daya Ikan Kalbar
            </span>
          </div>

          <Link
            href={user ? (me?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-river-soft text-river transition duration-200 hover:scale-105 hover:bg-river hover:text-white active:scale-95"
            title={user ? (me?.role === 'admin' ? 'Dashboard Admin' : 'Dashboard Buyer') : 'Masuk'}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-32 pt-2 sm:max-w-3xl">
        <Storefront products={(products ?? []) as Product[]} profile={me} loggedIn={!!user} />
      </main>
    </>
  )
}
