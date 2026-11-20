import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const go = (to: string, search = '') => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = search
    return NextResponse.redirect(url)
  }

  const protectedArea = path.startsWith('/dashboard') || path.startsWith('/admin')
  if (protectedArea && !user) return go('/login', `?next=${encodeURIComponent(path)}`)

  if (user && (path.startsWith('/admin') || path === '/login' || path === '/register')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    if (path.startsWith('/admin') && !isAdmin) return go('/dashboard')
    if (path === '/login' || path === '/register') return go(isAdmin ? '/admin' : '/dashboard')
  }
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'] }
