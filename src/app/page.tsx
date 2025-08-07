'use client'

import dynamicImport from 'next/dynamic'

// useAuthを使用するコンポーネントを動的にインポート
const ClientHome = dynamicImport(() => import('../components/ClientHome'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">読み込み中...</span>
    </div>
  ),
})

export default function Home() {
  return <ClientHome />
}

// 静的生成を無効にして、サーバーサイドレンダリングを防ぐ
export const dynamic = 'force-dynamic'