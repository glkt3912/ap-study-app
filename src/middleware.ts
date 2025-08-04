import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 本番環境で除外するデバッグページのパス
const DEBUG_PAGES = [
  '/debug',
  '/api-test', 
  '/env-check',
  '/css-test',
  '/simple',
  '/test-dark'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 本番環境でデバッグページにアクセスした場合は404を返す
  if (process.env.NODE_ENV === 'production' && DEBUG_PAGES.includes(pathname)) {
    return new NextResponse(null, { status: 404 })
  }
  
  // 開発環境またはその他のページは通常処理
  return NextResponse.next()
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