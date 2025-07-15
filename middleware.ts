import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Add security headers to fix "INTE SÄKER" warnings
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Force HTTPS in production
  if (req.nextUrl.protocol === 'http:' && process.env.NODE_ENV === 'production') {
    const httpsUrl = new URL(req.url)
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl)
  }

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing. Auth middleware will be skipped.")
    return res
  }

  // Only handle auth refresh, let client handle redirects
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Just refresh the session, don't make decisions based on it
    await supabase.auth.getSession()
    console.log("Middleware: Session refreshed for path:", req.nextUrl.pathname)
  } catch (error) {
    console.error("Middleware: Error refreshing session:", error)
  }

  // Let the client handle all auth logic
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

