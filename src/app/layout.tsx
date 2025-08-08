import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { MonitoringProvider } from '../components/MonitoringProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '応用情報技術者試験 学習管理アプリ',
  description: '応用情報技術者試験の学習進捗を管理するアプリケーション',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AP Study',
  },
  icons: {
    apple: '/icon-192x192.png',
  },
}

export function generateViewport() {
  return {
    themeColor: '#3B82F6',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <MonitoringProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MonitoringProvider>
        {/* Service Worker disabled for debugging */}
      </body>
    </html>
  )
}