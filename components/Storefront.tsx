'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import OrderDrawer from '@/components/OrderDrawer'
import { kg, rupiah } from '@/lib/format'
import type { Product, Profile } from '@/lib/types'

type FilterTab = 'all' | 'ready' | 'preorder' | 'wholesale'

const HERO_SLIDES = [
  {
    titleTop: 'Segar Langsung.',
    titleBottom: 'Panen Harian.',
    desc: 'Ikan kolam Kalbar hidup, segar es, atau bersih siap masak.',
    cta: 'Pesan Sekarang',
    badge: 'Panen Pagi • Fresh Market',
  },
  {
    titleTop: 'Harga Grosir.',
    titleBottom: 'Warung & Usaha.',
    desc: 'Potongan harga otomatis untuk pesanan partai & kebutuhan usaha.',
    cta: 'Cek Grosir',
    badge: 'Hemat per Kilogram',
  },
  {
    titleTop: 'Pre-Order Kolam.',
    titleBottom: 'Siap Jadwal Panen.',
    desc: 'Booking ikan pilihan sebelum panen agar stok aman untuk acara.',
    cta: 'Lihat Pre-Order',
    badge: 'Jadwal Panen Terukur',
  },
]

export default function Storefront({
  products,
  profile,
  loggedIn,
}: {
  products: Product[]
  profile: Profile | null
  loggedIn: boolean
}) {
  const [selected, setSelected] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [tab, setTab] = useState<FilterTab>('all')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const onOpenMenu = () => setMenuOpen(true)
    window.addEventListener('open-vibe-menu', onOpenMenu)
    return () => window.removeEventListener('open-vibe-menu', onOpenMenu)
  }, [])

  const isAdmin = profile?.role === 'admin'
  const roleLabel = !loggedIn ? 'Tamu' : isAdmin ? 'Admin' : 'Buyer'
  const accountName = loggedIn
    ? profile?.full_name || (isAdmin ? 'Administrator' : 'Pembeli')
    : 'Belum Masuk Akun'
  const dashboardHref = loggedIn ? (isAdmin ? '/admin' : '/dashboard') : '/login'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.size_spec.toLowerCase().includes(q)) {
        return false
      }
      if (tab === 'ready') return p.availability_type === 'ready' && p.stock_kg > 0
      if (tab === 'preorder') return p.availability_type === 'preorder'
      if (tab === 'wholesale') return p.wholesale_price_per_kg != null
      return true
    })
  }, [products, search, tab])

  const categories: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: 'Semua',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: 'ready',
      label: 'Siap Kirim',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
          <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
        </svg>
      ),
    },
    {
      id: 'preorder',
      label: 'Pre-Order',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      id: 'wholesale',
      label: 'Grosir',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m2 7 10-4 10 4-10 4-10-4Z" />
          <path d="m2 17 10 4 10-4" />
          <path d="m2 12 10 4 10-4" />
        </svg>
      ),
    },
  ]

  const currentSlide = HERO_SLIDES[slideIdx]

  const handleSlideCta = () => {
    if (slideIdx === 1) setTab('wholesale')
    else if (slideIdx === 2) setTab('preorder')
    const el = document.getElementById('katalog-ikan')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Slide Drawer Menu Kiri Atas (Aktif Saat Diklik) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <aside className="animate-vibe-fade-up relative z-10 flex h-full w-72 max-w-[82vw] flex-col justify-between bg-[#124E3B] p-5 text-white shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                    Mode {roleLabel}
                  </span>
                  <h2 className="mt-1.5 font-display text-base font-extrabold text-white">
                    {accountName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup Menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                >
                  ✕
                </button>
              </div>

              <nav className="mt-5 space-y-2 text-sm font-bold">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-white transition hover:bg-white/20"
                >
                  <span>Katalog Ikan Segar</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-emerald-50 transition hover:bg-white/10"
                >
                  <span>Dashboard Buyer</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-emerald-50 transition hover:bg-white/10"
                >
                  <span>Dashboard Admin</span>
                  <span>→</span>
                </Link>
                <Link
                  href={loggedIn ? '/dashboard' : '/login'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-emerald-50 transition hover:bg-white/10"
                >
                  <span>{loggedIn ? 'Profil & Pesanan' : 'Masuk / Daftar Akun'}</span>
                  <span>→</span>
                </Link>
              </nav>
            </div>

            <div className="rounded-2xl bg-black/20 p-3.5 text-xs text-emerald-100/90">
              <p className="font-bold text-white">Budi Daya Ikan Kalbar</p>
              <p className="mt-0.5 text-[11px]">Geser banner utama untuk ganti promo &amp; info panen.</p>
            </div>
          </aside>
        </div>
      )}

      
      {/* Tombol Buka Slide Menu Kiri Atas */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Buka Menu"
          className="flex h-10 items-center gap-2 rounded-xl border border-line/80 bg-white px-3 text-xs font-bold text-ink shadow-xs transition duration-200 hover:scale-105 hover:bg-river-soft active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h11M4 17h16" />
          </svg>
          <span>Menu</span>
        </button>
        <span className="rounded-full bg-[#EAF6F0] px-3 py-1 text-[11px] font-bold text-[#124E3B]">
          Mode {roleLabel}
        </span>
      </div>

      {/* Swipeable Hero Banner (Bisa Digeser Touch / Klik Indikator) */}
      <section
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
          const diff = touchStartX.current - endX
          if (diff > 40) {
            setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
          } else if (diff < -40) {
            setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
          touchStartX.current = null
        }}
        className="animate-vibe-fade-up relative mb-6 select-none overflow-hidden rounded-[26px] bg-gradient-to-r from-[#114232] via-[#1B6B50] to-[#68C69B] p-6 text-white shadow-lg shadow-[#114232]/20"
      >
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-white/15 blur-xl" />

        <div key={slideIdx} className="animate-vibe-fade-up relative z-10 flex items-center justify-between gap-3">
          <div className="max-w-[66%]">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-50">
              {currentSlide.badge}
            </span>
            <h1 className="mt-1.5 font-display text-[22px] font-extrabold leading-[1.18] text-white sm:text-3xl">
              {currentSlide.titleTop}
              <br />
              {currentSlide.titleBottom}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-50/90 sm:text-sm">
              {currentSlide.desc}
            </p>
            <button
              type="button"
              onClick={handleSlideCta}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-extrabold text-[#114232] shadow-sm transition duration-200 hover:scale-105 hover:bg-emerald-50 active:scale-95"
            >
              {currentSlide.cta}
            </button>
          </div>

          <div className="animate-vibe-float flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm sm:h-28 sm:w-28">
            <svg viewBox="0 0 24 24" className="h-14 w-14 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
              <path d="M18 12v.5" />
              <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
              <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
            </svg>
          </div>
        </div>

        {/* Interactive Slide Dots (Bisa Diklik & Geser) */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === slideIdx
            return (
              <button
                key={s.titleTop}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setSlideIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active ? 'w-5 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/75'
                }`}
              />
            )
          })}
        </div>
      </section>

      {/* Delivery Area & Quick Tags */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-line/80 bg-[#F6FBF8] px-3.5 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-ink">
          <span className="h-2 w-2 rounded-full bg-[#15803D] animate-pulse" />
          <span>Pengiriman Area Kalbar • Segar Harian</span>
        </div>
        <span className="font-bold text-[#124E3B]">0.5 kg+</span>
      </div>

      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {['Nila', 'Patin', 'Lele', 'Gurame', 'Hidup', 'Bersih', 'Grosir'].map((tag) => {
          const active = search.toLowerCase() === tag.toLowerCase()
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag === 'Grosir') {
                  setTab(tab === 'wholesale' ? 'all' : 'wholesale')
                  return
                }
                setSearch(active ? '' : tag)
                setShowSearch(true)
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition duration-150 active:scale-95 ${
                active || (tag === 'Grosir' && tab === 'wholesale')
                  ? 'bg-[#124E3B] text-white'
                  : 'bg-[#EAF6F0] text-[#124E3B] hover:bg-[#124E3B]/15'
              }`}
            >
              #{tag}
            </button>
          )
        })}
      </div>

      {/* Squircle Category Bar */}
      <div className="mb-6 flex items-center justify-between gap-2">
        {categories.map((c) => {
          const active = tab === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id)}
              className="flex flex-1 flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-[#124E3B] text-white shadow-md shadow-[#124E3B]/25 scale-105'
                    : 'bg-[#F1F6F3] text-ink hover:bg-river-soft'
                }`}
              >
                {c.icon}
              </span>
              <span className={`text-xs font-semibold ${active ? 'text-[#124E3B]' : 'text-mute'}`}>
                {c.label}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex flex-1 flex-col items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
              showSearch || search
                ? 'bg-[#124E3B] text-white shadow-md shadow-[#124E3B]/25 scale-105'
                : 'bg-[#F1F6F3] text-ink hover:bg-river-soft'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-mute">Cari</span>
        </button>
      </div>

      {(showSearch || search) && (
        <div className="animate-vibe-fade-up mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ikan nila, patin, lele..."
            className="input !rounded-2xl !bg-[#F4F9F6]"
            autoFocus
          />
        </div>
      )}

      {/* Section Header */}
      <div id="katalog-ikan" className="mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">Pilihan Segar</h2>
        <button
          type="button"
          onClick={() => {
            setTab('all')
            setSearch('')
          }}
          className="text-xs font-semibold text-mute hover:text-[#124E3B]"
        >
          Lihat Semua ({products.length})
        </button>
      </div>

      {/* Product Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-[#EAF6F0] p-8 text-center">
          <p className="font-bold text-ink">Ikan tidak ditemukan</p>
          <p className="mt-1 text-xs text-mute">Coba pilih kategori lain untuk melihat stok tersedia.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {filtered.map((p) => {
            const soldOut = p.stock_kg <= 0 && p.availability_type !== 'preorder'
            const isLiked = !!liked[p.id]

            return (
              <li
                key={p.id}
                onClick={() => !soldOut && setSelected(p)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-[24px] bg-[#EAF6F0] p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                  soldOut ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLiked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                    }}
                    aria-label="Favorit"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink/70 transition hover:scale-110 hover:bg-white/70"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-transform ${isLiked ? 'scale-110 fill-merah text-merah' : 'fill-none text-ink'}`}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </button>

                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#124E3B]">
                    {soldOut ? 'Habis' : kg(p.stock_kg)}
                  </span>
                </div>

                <div className="my-2.5 flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-14 w-14 text-[#124E3B]/35 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
                      <path d="M18 12v.5" />
                      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
                    </svg>
                  )}
                </div>

                <div className="relative pr-9">
                  <h3 className="line-clamp-1 font-display text-[15px] font-extrabold text-ink">
                    {p.name}
                  </h3>
                  <p className="line-clamp-1 text-[11px] font-medium text-mute">{p.size_spec}</p>
                  <p className="mt-1.5 font-display text-base font-extrabold text-[#15803D]">
                    {rupiah(p.price_per_kg)}
                    <span className="text-[10px] font-semibold text-mute">/kg</span>
                  </p>

                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(p)
                    }}
                    aria-label={`Pesan ${p.name}`}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#124E3B] text-white shadow-sm transition duration-200 hover:scale-110 hover:bg-[#0D3A2C] active:scale-90 disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Dashboard Card Section Below Catalog (Menampilkan Info Akun Buyer / Admin) */}
      <section className="mt-7 rounded-[24px] border border-line bg-[#F6FBF8] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-[#124E3B] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                {roleLabel}
              </span>
              <span className="text-xs font-bold text-[#124E3B]">
                {isAdmin ? 'Dashboard Admin' : 'Dashboard Buyer'}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-base font-extrabold text-ink">
              {accountName}
            </h3>
            <p className="text-xs text-mute">
              {!loggedIn
                ? 'Masuk untuk mengakses akun Buyer atau Admin & pantau pesanan.'
                : isAdmin
                  ? 'Kelola pesanan masuk, verifikasi bukti QRIS, stok & panen ikan.'
                  : 'Pantau status pesanan ikan, upload bukti QRIS & riwayat belanja.'}
            </p>
          </div>

          <Link
            href={dashboardHref}
            className="shrink-0 rounded-full bg-[#124E3B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition duration-200 hover:scale-105 hover:bg-[#0D3A2C] active:scale-95"
          >
            {!loggedIn ? 'Masuk' : isAdmin ? 'Buka Admin' : 'Buka Buyer'}
          </Link>
        </div>
      </section>

      {/* Curved Dark Bottom Navigation Dock */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
      >
        <div className="relative flex h-16 items-center justify-around rounded-[28px] bg-[#131C18] px-3 text-white/65 shadow-xl shadow-black/25">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-[#34D399]"
            title="Beranda"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-semibold">Beranda</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setShowSearch(true)
              window.scrollTo({ top: 180, behavior: 'smooth' })
            }}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Cari Ikan"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="text-[10px] font-medium">Cari</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const firstAvail = products.find((item) => item.stock_kg > 0 || item.availability_type === 'preorder')
              if (firstAvail) setSelected(firstAvail)
            }}
            aria-label="Pesan Cepat"
            className="animate-vibe-float -mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#22A06B] to-[#124E3B] text-white shadow-lg transition hover:scale-110 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
              <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
            </svg>
          </button>

          <Link
            href={dashboardHref}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Pesanan"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="text-[10px] font-medium">Pesanan</span>
          </Link>

          <Link
            href={dashboardHref}
            className="flex flex-col items-center gap-0.5 transition hover:text-white"
            title="Dashboard"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="text-[10px] font-medium">{roleLabel}</span>
          </Link>
        </div>
      </nav>

      {selected && (
        <OrderDrawer
          product={selected}
          profile={profile}
          loggedIn={loggedIn}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
