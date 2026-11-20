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
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-river text-white shadow-sm shadow-river/25">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                <path d="M18 12v.5" />
                <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
                <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
              </svg>
            </span>
            <div>
              <span className="block font-display text-base font-extrabold leading-tight text-ink">
                Budi Daya Ikan
              </span>
              <span className="block text-[11px] font-semibold tracking-wide text-river">
                KALIMANTAN BARAT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href={me?.role === 'admin' ? '/admin' : '/dashboard'}
                className="btn-primary !min-h-[40px] !rounded-full !px-4 text-sm"
              >
                {me?.role === 'admin' ? 'Panel Admin' : 'Pesanan Saya'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary !min-h-[40px] !rounded-full !px-5 text-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-5">
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F5132] via-[#15803D] to-[#22C55E] p-6 text-white shadow-lg shadow-river/20 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 left-1/3 h-40 w-40 rounded-full bg-emerald-300/15 blur-xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Panen Harian • Segar &amp; Higienis
            </span>

            <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight text-white sm:text-4xl">
              Ikan Segar Pilihan, Langsung dari Kolam Kalbar.
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-emerald-50 sm:text-base">
              Pesan per kilo sesuai kebutuhan dapur atau usaha Anda. Bebas pilih kondisi{' '}
              <strong className="font-semibold text-white">hidup</strong>,{' '}
              <strong className="font-semibold text-white">segar es</strong>, atau{' '}
              <strong className="font-semibold text-white">bersih siap masak</strong> dengan harga grosir otomatis.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-xl bg-black/15 px-3 py-1.5 text-emerald-50 backdrop-blur-sm">
                ✓ Timbangan Pas &amp; Jujur
              </span>
              <span className="rounded-xl bg-black/15 px-3 py-1.5 text-emerald-50 backdrop-blur-sm">
                ✓ Layanan Bersih Siap Masak
              </span>
              <span className="rounded-xl bg-black/15 px-3 py-1.5 text-emerald-50 backdrop-blur-sm">
                ✓ Harga Grosir Warung
              </span>
            </div>
          </div>
        </section>

        <Storefront products={(products ?? []) as Product[]} profile={me} loggedIn={!!user} />
      </main>

      <footer className="border-t border-line/80 bg-white py-8 text-center text-sm text-mute">
        <p className="font-semibold text-ink">Budi Daya Ikan Kalbar</p>
        <p className="mt-1 text-xs">© {new Date().getFullYear()} Segar dari Kolam untuk Keluarga &amp; Pelaku Usaha.</p>
      </footer>
    </>
  )
}
