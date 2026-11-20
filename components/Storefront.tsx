'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type FilterTab = 'all' | 'ready' | 'preorder' | 'wholesale'

interface StorefrontProps {
  products: any[]
  profile: any
  loggedIn: boolean
}

interface CartItem {
  key: string
  productId: string
  name: string
  price: number
  qty: number
  prep: string
}

const HERO_SLIDES = [
  {
    badge: 'Panen Pagi • Fresh Market',
    titleTop: 'Segar Langsung.',
    titleBottom: 'Panen Harian.',
    desc: 'Ikan kolam Kalbar hidup, segar es, atau bersih siap masak.',
    cta: 'Pesan Sekarang',
  },
  {
    badge: 'Pasokan Warung & Resto',
    titleTop: 'Harga Grosir.',
    titleBottom: 'Stok Terjaga.',
    desc: 'Pemesanan rutin 10 kg+ dengan pengiriman oksigen & coolbox.',
    cta: 'Lihat Paket Grosir',
  },
  {
    badge: 'Jadwal Panen Terjadwal',
    titleTop: 'Booking Panen.',
    titleBottom: 'Pagi & Sore.',
    desc: 'Pilih waktu panen & opsi bersih sisik insang sebelum diantar.',
    cta: 'Atur Pre-Order',
  },
]

const TAGS = ['#Nila', '#Patin', '#Lele', '#Gurame', '#Hidup', '#Bersih']
const PREP_OPTIONS = ['Utuh Hidup', 'Segar (Es)', 'Bersih Sisik & Insang', 'Belah Bakar', 'Fillet']

const DEMO_PRODUCTS = [
  {
    id: 'demo-nila',
    name: 'Ikan Nila Merah Kolam Deras',
    category: 'Nila',
    condition: 'Hidup',
    size_info: '3–4 ekor / kg',
    price_per_kg: 34000,
    stock_kg: 28,
    fulfillment_type: 'ready',
    description: 'Nila merah daging tebal tanpa bau lumpur, dipanen langsung saat pesanan masuk.',
  },
  {
    id: 'demo-lele',
    name: 'Ikan Lele Sangkuriang Segar',
    category: 'Lele',
    condition: 'Bersih',
    size_info: '6–8 ekor / kg',
    price_per_kg: 26000,
    stock_kg: 35,
    fulfillment_type: 'ready',
    description: 'Lele pakan pelet organik, tersedia hidup maupun bersih siap goreng.',
  },
  {
    id: 'demo-patin',
    name: 'Ikan Patin Sungai Kapuas',
    category: 'Patin',
    condition: 'Segar',
    size_info: '1–2 ekor / kg',
    price_per_kg: 29000,
    stock_kg: 19,
    fulfillment_type: 'wholesale',
    description: 'Patin segar berdaging lembut, cocok untuk pindang, asam pedas, dan kebutuhan warung.',
  },
  {
    id: 'demo-gurame',
    name: 'Ikan Gurame Hitam Panen Pagi',
    category: 'Gurame',
    condition: 'Hidup',
    size_info: '500–700 gr / ekor',
    price_per_kg: 52000,
    stock_kg: 12,
    fulfillment_type: 'preorder',
    description: 'Gurame kolam air jernih dengan cita rasa gurih manis, bisa belah bakar.',
  },
]

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)


const NavSvg = ({ name, active }: { name: "home" | "search" | "cart" | "orders" | "profile"; active?: boolean }) => {
  const fillTone = active ? "#D4EDE0" : "none";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5Z" fill={fillTone} />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" fill={fillTone} />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }
  if (name === "cart") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7Z" fill={fillTone} />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  if (name === "orders") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" fill={fillTone} />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={fillTone} />
      <circle cx="12" cy="9.5" r="2.7" />
      <path d="M7.5 18.2a5.5 5.5 0 0 1 9 0" />
    </svg>
  );
};

const CatSvg = ({ id }: { id: string }) => {
  if (id === "all") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    );
  }
  if (id === "ready") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
        <path d="M18 12v.5" />
        <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      </svg>
    );
  }
  if (id === "preorder") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
      <path d="m3 12 9 4.5 9-4.5" />
      <path d="m3 16.5 9 4.5 9-4.5" />
    </svg>
  );
};

export default function Storefront({ products, profile, loggedIn }: StorefrontProps) {
  const [activeNav, setActiveNav] = useState<"home" | "search" | "cart" | "orders" | "profile">("home")
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tab, setTab] = useState<FilterTab>('all')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const [selectedPrep, setSelectedPrep] = useState<Record<string, string>>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [harvestSlot, setHarvestSlot] = useState('Panen Pagi (06.00–09.00)')
  const [deliveryMethod, setDeliveryMethod] = useState('Kurir Lokal (Oksigen / Coolbox)')
  const [buyerNote, setBuyerNote] = useState('')

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

  const sourceProducts = products && products.length > 0 ? products : DEMO_PRODUCTS
  const isDemoMode = !products || products.length === 0

  const filteredProducts = useMemo(() => {
    return sourceProducts.filter((item) => {
      const name = (item.name || '').toLowerCase()
      const desc = (item.description || '').toLowerCase()
      const cat = (item.category || '').toLowerCase()
      const cond = (item.condition || '').toLowerCase()
      const fType = (item.fulfillment_type || 'ready').toLowerCase()

      if (tab === 'ready' && fType !== 'ready') return false
      if (tab === 'preorder' && fType !== 'preorder') return false
      if (tab === 'wholesale' && fType !== 'wholesale' && Number(item.stock_kg ?? 10) < 10) return false

      if (activeTag) {
        const cleanTag = activeTag.replace('#', '').toLowerCase()
        if (!name.includes(cleanTag) && !cat.includes(cleanTag) && !cond.includes(cleanTag) && !desc.includes(cleanTag)) {
          return false
        }
      }

      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (!name.includes(q) && !desc.includes(q) && !cat.includes(q)) return false
      }

      return true
    })
  }, [sourceProducts, tab, activeTag, query])

  const currentSlide = HERO_SLIDES[slideIdx]

  const handleSlideCta = () => {
    if (slideIdx === 1) setTab('wholesale')
    else if (slideIdx === 2) setTab('preorder')
    else setTab('all')
    document.getElementById('katalog-ikan')?.scrollIntoView({ behavior: 'smooth' })
  }

  const addToCart = (item: any) => {
    const prep = selectedPrep[item.id] || PREP_OPTIONS[0]
    const key = `${item.id}::${prep}`
    const price = Number(item.price_per_kg ?? item.price ?? 0)
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.key === key)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: Number((copy[idx].qty + 0.5).toFixed(1)) }
        return copy
      }
      return [...prev, { key, productId: item.id, name: item.name, price, qty: 1, prep }]
    })
  }

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.key === key ? { ...c, qty: Number((c.qty + delta).toFixed(1)) } : c))
        .filter((c) => c.qty >= 0.5)
    )
  }

  const totalKg = cart.reduce((acc, c) => acc + c.qty, 0)
  const totalPrice = cart.reduce((acc, c) => acc + c.qty * c.price, 0)

  const handleCheckoutWhatsApp = () => {
    const lines = cart.map(
      (c, i) => `${i + 1}. ${c.name} (${c.qty} kg) — Opsi: ${c.prep} = ${formatRp(c.qty * c.price)}`
    )
    const msg = [
      'Halo *Budi Daya Ikan Kalbar*, saya ingin memesan ikan segar:',
      '',
      ...lines,
      '',
      `*Total Berat:* ${totalKg} kg`,
      `*Estimasi Total:* ${formatRp(totalPrice)}`,
      `*Jadwal Panen:* ${harvestSlot}`,
      `*Metode:* ${deliveryMethod}`,
      buyerNote ? `*Catatan:* ${buyerNote}` : '',
      loggedIn && profile?.full_name ? `*Pemesan:* ${profile.full_name}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Slide Drawer Menu Kiri Atas */}
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#EAF6F0]/75">
                    Budi Daya Ikan Kalbar
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold">{accountName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20"
                >
                  Tutup
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs">
                <span className="text-[#EAF6F0]/80">Status Akun: </span>
                <span className="font-extrabold text-white">{roleLabel}</span>
              </div>

              <nav className="mt-5 flex flex-col gap-1.5 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('all')
                    setActiveTag(null)
                    setMenuOpen(false)
                  }}
                  className="rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                >
                  Katalog Panen Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('wholesale')
                    setMenuOpen(false)
                  }}
                  className="rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                >
                  Paket Grosir Warung & Resto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('preorder')
                    setMenuOpen(false)
                  }}
                  className="rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                >
                  Jadwal Booking Panen
                </button>
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                >
                  {loggedIn ? (isAdmin ? 'Dashboard Admin' : 'Dashboard & Pesanan Saya') : 'Masuk / Daftar Akun'}
                </Link>
              </nav>
            </div>

            <div className="rounded-xl bg-[#15803D]/50 p-3 text-[11px] leading-relaxed text-[#EAF6F0]">
              Panen Pagi 06.00–09.00 & Panen Sore 15.00–18.00. Gratis bersihkan sisik & insang.
            </div>
          </aside>
        </div>
      )}

      {/* Top Bar Menu & Role Badge */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Buka Menu"
          className="flex h-10 items-center gap-2 rounded-xl border border-line/80 bg-white px-3.5 text-xs font-bold text-ink shadow-xs transition duration-200 hover:scale-105 hover:bg-[#EAF6F0] active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h11M4 17h16" />
          </svg>
          <span>Menu</span>
        </button>

        <Link
          href={dashboardHref}
          className="flex items-center gap-1.5 rounded-full bg-[#EAF6F0] px-3.5 py-1.5 text-[11px] font-extrabold text-[#124E3B] transition hover:bg-[#124E3B] hover:text-white"
        >
          <span className="h-2 w-2 rounded-full bg-[#15803D]" />
          <span>Mode {roleLabel}</span>
        </Link>
      </div>

      {/* Swipeable Hero Banner */}
      <section
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const diff = e.changedTouches[0].clientX - touchStartX.current
          if (diff < -40) setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
          if (diff > 40) setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          touchStartX.current = null
        }}
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#124E3B] via-[#16624A] to-[#15803D] p-5 text-white shadow-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-[68%]">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-[#EAF6F0]">
              {currentSlide.badge}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight">
              {currentSlide.titleTop}
              <br />
              {currentSlide.titleBottom}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#EAF6F0]/90">{currentSlide.desc}</p>
            <button
              type="button"
              onClick={handleSlideCta}
              className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#124E3B] shadow-sm transition hover:scale-105 active:scale-95"
            >
              {currentSlide.cta}
            </button>
          </div>

          <div className="animate-vibe-float flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xs">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#EAF6F0]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
              <path d="M18 12v.5" />
              <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
              <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
            </svg>
          </div>
        </div>

        {/* Interactive Slide Dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === slideIdx
            return (
              <button
                key={s.titleTop}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setSlideIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            )
          })}
        </div>
      </section>

      {/* Info Bar Kolam Real-Time */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-line/70 bg-white px-4 py-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#15803D]" />
          </span>
          <span>Pengiriman Area Kalbar • Segar Harian</span>
        </div>
        <span className="font-extrabold text-[#124E3B]">0.5 kg+</span>
      </div>

      {/* Hashtag Quick Filter */}
      <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TAGS.map((tag) => {
          const isSelected = activeTag === tag
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(isSelected ? null : tag)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                isSelected
                  ? 'border-[#124E3B] bg-[#124E3B] text-white'
                  : 'border-line/80 bg-white text-ink hover:bg-[#EAF6F0]'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Quick Category Icons */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'ready', label: 'Siap Kirim' },
          { id: 'preorder', label: 'Pre-Order' },
          { id: 'wholesale', label: 'Grosir' },
        ].map((item) => {
          const active = tab === item.id && !showSearch
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setShowSearch(false)
                setTab(item.id as FilterTab)
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base shadow-2xs transition ${
                  active ? 'bg-[#124E3B] text-white' : 'border border-line/70 bg-white text-ink hover:bg-[#EAF6F0]'
                }`}
              >
                <CatSvg id={item.id} />
              </div>
              <span className={`text-[11px] font-bold ${active ? 'text-[#124E3B]' : 'text-ink/80'}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="flex flex-col items-center gap-1.5"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-base shadow-2xs transition ${
              showSearch ? 'bg-[#124E3B] text-white' : 'border border-line/70 bg-white text-ink hover:bg-[#EAF6F0]'
            }`}
          >
            <NavSvg name="search" />
          </div>
          <span className={`text-[11px] font-bold ${showSearch ? 'text-[#124E3B]' : 'text-ink/80'}`}>Cari</span>
        </button>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#124E3B]/30 bg-white px-3.5 py-2 shadow-xs">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ikan nila, lele, patin, gurame..."
            className="w-full bg-transparent text-xs font-medium text-ink outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[11px] font-bold text-[#124E3B]"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Katalog Produk */}
      <section id="katalog-ikan" className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-ink">Pilihan Segar</h2>
            {isDemoMode && (
              <p className="text-[11px] text-ink/60">Menampilkan katalog contoh kolam (siap pesan via WA)</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setTab('all')
              setActiveTag(null)
              setQuery('')
            }}
            className="text-xs font-bold text-[#15803D] hover:underline"
          >
            Lihat Semua ({filteredProducts.length})
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-line bg-white p-6 text-center">
            <p className="text-sm font-extrabold text-ink">Ikan belum ditemukan untuk filter ini</p>
            <p className="mt-1 text-xs text-ink/65">Coba reset filter kategori atau kata kunci pencarian.</p>
            <button
              type="button"
              onClick={() => {
                setTab('all')
                setActiveTag(null)
                setQuery('')
              }}
              className="mt-3 rounded-full bg-[#124E3B] px-4 py-2 text-xs font-bold text-white"
            >
              Tampilkan Semua Ikan
            </button>
          </div>
        ) : (
          <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {filteredProducts.map((item) => {
              const price = Number(item.price_per_kg ?? item.price ?? 0)
              const stock = Number(item.stock_kg ?? 20)
              const currentPrep = selectedPrep[item.id] || PREP_OPTIONS[0]
              const isFav = !!liked[item.id]

              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl border border-line/75 bg-white p-4 shadow-2xs transition hover:border-[#15803D]/50 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[#EAF6F0] px-2.5 py-0.5 text-[10px] font-extrabold text-[#124E3B]">
                          {item.condition || 'Segar Kolam'}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-ink/75">
                          {item.size_info || '3–5 ekor/kg'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLiked((p) => ({ ...p, [item.id]: !p[item.id] }))}
                        aria-label="Favorit"
                        className="text-sm"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isFav ? "#15803D" : "none"} stroke={isFav ? "#15803D" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-7-4.35-7-10.1A4.4 4.4 0 0 1 9.4 6c1.54 0 2.6.78 2.6.78S13.06 6 14.6 6A4.4 4.4 0 0 1 19 10.4c0 5.75-7 10.1-7 10.1Z" /></svg>
                      </button>
                    </div>

                    <h3 className="mt-2.5 text-sm font-extrabold text-ink">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/70">
                      {item.description || 'Ikan segar budidaya lokal Kalimantan Barat, dipanen langsung saat dipesan.'}
                    </p>

                    {/* Pemilih Opsi Pengolahan Ikan */}
                    <div className="mt-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-ink/60">
                        Opsi Pengolahan:
                      </label>
                      <select
                        value={currentPrep}
                        onChange={(e) => setSelectedPrep((p) => ({ ...p, [item.id]: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-line bg-[#EAF6F0]/45 px-2.5 py-1.5 text-xs font-semibold text-[#124E3B] outline-none"
                      >
                        {PREP_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold text-ink/60">Sisa kolam: {stock} kg</p>
                      <p className="text-sm font-extrabold text-[#124E3B]">
                        {formatRp(price)} <span className="text-[11px] font-medium text-ink/60">/ kg</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="rounded-xl bg-[#124E3B] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#15803D] active:scale-95"
                    >
                      + Keranjang
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Kartu Info Akun Buyer / Admin */}
      <section className="mt-6 rounded-3xl border border-[#124E3B]/15 bg-[#EAF6F0] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#124E3B]/75">
              Status Akun Anda ({roleLabel})
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#124E3B]">{accountName}</p>
            <p className="mt-0.5 text-xs text-[#124E3B]/80">
              {loggedIn
                ? isAdmin
                  ? 'Kelola stok panen kolam, harga harian, dan pesanan masuk.'
                  : 'Pantau riwayat pesanan & pesan ulang ikan favorit lebih cepat.'
                : 'Masuk untuk menyimpan alamat pengiriman & riwayat pesanan.'}
            </p>
          </div>
          <Link
            href={dashboardHref}
            className="shrink-0 rounded-xl bg-[#124E3B] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#15803D]"
          >
            {loggedIn ? 'Buka Panel' : 'Masuk'}
          </Link>
        </div>
      </section>

      {/* Spacer Bawah Anti-Tabrak */}
      <div className={cart.length > 0 ? "h-44" : "h-28"} aria-hidden="true" />

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-28 z-40 mx-auto max-w-md px-5 sm:max-w-3xl">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-[#124E3B] px-4 py-3 text-white shadow-xl transition hover:bg-[#15803D]"
          >
            <div className="text-left">
              <p className="text-[11px] font-semibold text-[#EAF6F0]">
                {cart.length} jenis ikan • Total {totalKg} kg
              </p>
              <p className="text-sm font-extrabold">{formatRp(totalPrice)}</p>
            </div>
            <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#124E3B]">
              Lanjut Pesan →
            </span>
          </button>
        </div>
      )}

      {/* Bottom Sheet Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
          <div className="relative z-10 max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-ink">Keranjang Panen Segar</h3>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-ink"
              >
                Tutup
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {cart.map((c) => (
                <div key={c.key} className="flex items-center justify-between rounded-2xl border border-line/70 p-3">
                  <div>
                    <p className="text-xs font-extrabold text-ink">{c.name}</p>
                    <p className="text-[11px] font-semibold text-[#15803D]">Opsi: {c.prep}</p>
                    <p className="mt-0.5 text-xs font-bold text-ink/80">{formatRp(c.qty * c.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(c.key, -0.5)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-extrabold"
                    >
                      -
                    </button>
                    <span className="min-w-[44px] text-center text-xs font-extrabold">{c.qty} kg</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(c.key, 0.5)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF6F0] text-sm font-extrabold text-[#124E3B]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-line pt-3 text-xs">
              <div>
                <label className="font-bold text-ink">Jadwal Panen:</label>
                <select
                  value={harvestSlot}
                  onChange={(e) => setHarvestSlot(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-semibold"
                >
                  <option>Panen Pagi (06.00–09.00)</option>
                  <option>Panen Sore (15.00–18.00)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink">Metode Pengambilan / Kirim:</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-semibold"
                >
                  <option>Kurir Lokal (Oksigen / Coolbox)</option>
                  <option>Ambil Sendiri di Kolam</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  placeholder="Contoh: minta ukuran sedang, pisah kantong..."
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <div>
                <p className="text-[11px] text-ink/65">Total ({totalKg} kg)</p>
                <p className="text-base font-extrabold text-[#124E3B]">{formatRp(totalPrice)}</p>
              </div>
              <button
                type="button"
                onClick={handleCheckoutWhatsApp}
                className="rounded-2xl bg-[#15803D] px-4 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-[#124E3B]"
              >
                Kirim Pesanan via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active-Circle Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto max-w-md px-4 sm:max-w-3xl">
        <div className="relative rounded-[28px] border border-line/80 bg-white px-2 pb-3 pt-2 shadow-[0_10px_30px_rgba(18,78,59,0.12)]">
          <div className="grid grid-cols-5 items-end">
            {/* Tab 1: Beranda */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("home")
                setShowSearch(false)
                setTab("all")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="group relative flex flex-col items-center justify-end"
            >
              <div
                className={`flex items-center justify-center transition-all duration-300 ${
                  activeNav === "home"
                    ? "-mt-8 h-14 w-14 rounded-full border-[4px] border-[#124E3B] bg-white text-[#124E3B] shadow-lg"
                    : "h-9 w-9 text-ink/45 group-hover:text-[#124E3B]"
                }`}
              >
                <NavSvg name="home" active={activeNav === "home"} />
              </div>
              <span
                className={`mt-1 text-[11px] transition-colors ${
                  activeNav === "home" ? "font-extrabold text-ink" : "font-medium text-ink/45"
                }`}
              >
                Beranda
              </span>
            </button>

            {/* Tab 2: Cari */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("search")
                setShowSearch(true)
                document.getElementById("katalog-ikan")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="group relative flex flex-col items-center justify-end"
            >
              <div
                className={`flex items-center justify-center transition-all duration-300 ${
                  activeNav === "search"
                    ? "-mt-7 h-13 w-13 rounded-full border-4 border-[#124E3B] bg-white text-[#124E3B] shadow-md"
                    : "h-9 w-9 text-ink/45 group-hover:text-[#124E3B]"
                }`}
              >
                <NavSvg name="search" active={activeNav === "search"} />
              </div>
              <span
                className={`mt-1 text-[11px] transition-colors ${
                  activeNav === "search" ? "font-extrabold text-ink" : "font-medium text-ink/45"
                }`}
              >
                Cari
              </span>
            </button>

            {/* Tab 3: Keranjang */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("cart")
                setCartOpen(true)
              }}
              aria-label="Keranjang"
              className="group relative flex flex-col items-center justify-end"
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  activeNav === "cart"
                    ? "-mt-7 h-13 w-13 rounded-full border-4 border-[#124E3B] bg-white text-[#124E3B] shadow-md"
                    : "h-9 w-9 text-ink/45 group-hover:text-[#124E3B]"
                }`}
              >
                <NavSvg name="cart" active={activeNav === "cart"} />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#15803D] px-1 text-[9px] font-extrabold text-white">
                    {cart.length}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[11px] transition-colors ${
                  activeNav === "cart" ? "font-extrabold text-ink" : "font-medium text-ink/45"
                }`}
              >
                Keranjang
              </span>
            </button>

            {/* Tab 4: Pesanan */}
            <Link
              href={dashboardHref}
              onClick={() => setActiveNav("orders")}
              className="group relative flex flex-col items-center justify-end"
            >
              <div
                className={`flex items-center justify-center transition-all duration-300 ${
                  activeNav === "orders"
                    ? "-mt-7 h-13 w-13 rounded-full border-4 border-[#124E3B] bg-white text-[#124E3B] shadow-md"
                    : "h-9 w-9 text-ink/45 group-hover:text-[#124E3B]"
                }`}
              >
                <NavSvg name="orders" active={activeNav === "orders"} />
              </div>
              <span
                className={`mt-1 text-[11px] transition-colors ${
                  activeNav === "orders" ? "font-extrabold text-ink" : "font-medium text-ink/45"
                }`}
              >
                Pesanan
              </span>
            </Link>

            {/* Tab 5: Profil / Role */}
            <Link
              href={dashboardHref}
              onClick={() => setActiveNav("profile")}
              className="group relative flex flex-col items-center justify-end"
            >
              <div
                className={`flex items-center justify-center transition-all duration-300 ${
                  activeNav === "profile"
                    ? "-mt-7 h-13 w-13 rounded-full border-4 border-[#124E3B] bg-white text-[#124E3B] shadow-md"
                    : "h-9 w-9 text-ink/45 group-hover:text-[#124E3B]"
                }`}
              >
                <NavSvg name="profile" active={activeNav === "profile"} />
              </div>
              <span
                className={`mt-1 text-[11px] transition-colors ${
                  activeNav === "profile" ? "font-extrabold text-ink" : "font-medium text-ink/45"
                }`}
              >
                {roleLabel}
              </span>
            </Link>
          </div>

          {/* Home Indicator Bar Bawah */}
          <div className="mx-auto mt-2.5 h-1 w-28 rounded-full bg-stone-300/80" />
        </div>
      </nav>
    </>
  )
}
