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
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 pb-2 pt-4 sm:max-w-3xl">
          <Link
            href={user ? (me?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-white text-ink shadow-xs transition hover:bg-river-soft"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h11M4 17h16" />
            </svg>
          </Link>

          <div className="text-center">
            <span className="font-display text-sm font-extrabold tracking-tight text-ink">
              Budi Daya Ikan Kalbar
            </span>
          </div>

          <Link
            href={user ? (me?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-river-soft text-river transition hover:bg-river hover:text-white"
            title={user ? 'Dashboard' : 'Masuk'}
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
        <section className="relative mb-6 overflow-hidden rounded-[26px] bg-gradient-to-r from-[#114232] via-[#1B6B50] to-[#68C69B] p-6 text-white shadow-lg shadow-[#114232]/20">
          <div className="pointer-events-none absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-white/15 blur-xl" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="max-w-[65%]">
              <h1 className="font-display text-[22px] font-extrabold leading-[1.18] text-white sm:text-3xl">
                Segar Langsung.
                <br />
                Panen Harian.
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-emerald-50/90 sm:text-sm">
                Ikan kolam Kalbar hidup, segar es, atau bersih siap masak.
              </p>
              <a
                href="#katalog-ikan"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-extrabold text-[#114232] shadow-sm transition hover:bg-emerald-50 active:scale-95"
              >
                Pesan Sekarang
              </a>
            </div>

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm sm:h-28 sm:w-28">
              <svg viewBox="0 0 24 24" className="h-14 w-14 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                <path d="M18 12v.5" />
                <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
                <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
              </svg>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
          </div>
        </section>

        <Storefront products={(products ?? []) as Product[]} profile={me} loggedIn={!!user} />
      </main>
    </>
  )
}
