import { createClient as createAdminClient } from "@supabase/supabase-js"
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Panel Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')
  const adminDb = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await adminDb.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <>
      <header className="border-b border-line bg-paper pt-3">
        <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between px-4">
          <Logo href="/admin" />
          <div className="flex gap-2">
            <Link href="/" className="btn-outline !min-h-[40px]">Toko</Link>
            <form action="/auth/signout" method="post"><button className="btn-outline !min-h-[40px]">Keluar</button></form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  )
}
