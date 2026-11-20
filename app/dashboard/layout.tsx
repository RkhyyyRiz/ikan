import Link from 'next/link'
import Logo from '@/components/Logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/" className="btn-outline !min-h-[40px]">Belanja</Link>
            <form action="/auth/signout" method="post"><button className="btn-outline !min-h-[40px]">Keluar</button></form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </>
  )
}
