import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 本番環境でデバッグページを404にリダイレクト
  if (process.env.NODE_ENV === 'production') {
    const debugPaths = [
      '/debug',
      '/api-test', 
      '/env-check',
      '/css-test',
      '/simple',
      '/test-dark'
    ]
    
    if (debugPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/debug/:path*',
    '/api-test/:path*',
    '/env-check/:path*',
    '/css-test/:path*',
    '/simple/:path*',
    '/test-dark/:path*'
  ]
}