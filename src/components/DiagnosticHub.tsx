'use client'

import Link from 'next/link'

export default function DiagnosticHub() {
  const diagnosticPages = [
    {
      title: '🧪 総合診断',
      description: 'CSS・JavaScript・API接続の総合テスト',
      url: '/debug',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '🎨 CSS専用テスト',
      description: 'Tailwind・カスタムCSS・ダークモードのテスト',
      url: '/css-test',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '🖥️ 環境チェック',
      description: 'ブラウザ・システム・パフォーマンス情報',
      url: '/env-check',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '🔌 API接続テスト',
      description: 'バックエンドAPI・レスポンス時間のテスト',
      url: '/api-test',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🧪 診断・テストページ
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diagnosticPages.map((page, index) => (
          <Link
            key={index}
            href={page.url}
            className={`${page.color} text-white p-6 rounded-lg transition-colors block`}
          >
            <h3 className="text-xl font-bold mb-2">
              {page.title}
            </h3>
            <p className="text-sm opacity-90">
              {page.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          💡 診断ページの使い方
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li><strong>問題発生時:</strong> まず「総合診断」で全体チェック</li>
          <li><strong>CSS問題:</strong> 「CSS専用テスト」で詳細確認</li>
          <li><strong>パフォーマンス:</strong> 「環境チェック」で性能測定</li>
          <li><strong>API問題:</strong> 「API接続テスト」でサーバー状態確認</li>
          <li><strong>チーム共有:</strong> スクリーンショットで問題報告</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          🔧 開発者向けクイックアクセス
        </h3>
        <div className="flex flex-wrap gap-2">
          <a 
            href="/debug" 
            className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            /debug
          </a>
          <a 
            href="/css-test" 
            className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            /css-test
          </a>
          <a 
            href="/env-check" 
            className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            /env-check
          </a>
          <a 
            href="/api-test" 
            className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700"
          >
            /api-test
          </a>
        </div>
      </div>
    </div>
  )
}