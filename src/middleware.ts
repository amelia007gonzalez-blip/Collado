import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = req.nextUrl

    // Protect /dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!session) {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/login'
            return NextResponse.redirect(redirectUrl)
        }
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/register') && session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}
