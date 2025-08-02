'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [mounted, setMounted] = useState(false)
  const [jsTest, setJsTest] = useState('未テスト')
  const [apiTest, setApiTest] = useState('未テスト')
  const [storageTest, setStorageTest] = useState('未テスト')

  useEffect(() => {
    setMounted(true)
    
    // JavaScript動作テスト
    try {
      const testArray = [1, 2, 3]
      const result = testArray.map(x => x * 2)
      setJsTest(result.join(',') === '2,4,6' ? '✅ 正常' : '❌ 異常')
    } catch (error) {
      setJsTest('❌ エラー: ' + error)
    }

    // LocalStorage テスト
    try {
      localStorage.setItem('debug-test', 'test-value')
      const value = localStorage.getItem('debug-test')
      setStorageTest(value === 'test-value' ? '✅ 正常' : '❌ 異常')
      localStorage.removeItem('debug-test')
    } catch (error) {
      setStorageTest('❌ エラー: ' + error)
    }

    // API テスト
    testApi()
  }, [])

  const testApi = async () => {
    try {
      const response = await fetch('/api/health', { method: 'GET' })
      if (response.ok) {
        setApiTest('✅ 正常 (200)')
      } else {
        setApiTest(`⚠️ レスポンス異常 (${response.status})`)
      }
    } catch (error) {
      setApiTest('❌ 接続エラー: ' + error)
    }
  }

  const testAlert = () => {
    alert('JavaScript動作確認: アラート表示成功！')
  }

  if (!mounted) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🧪 診断ページ
        </h1>

        {/* CSS テスト */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🎨 CSS・スタイリングテスト
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* インラインスタイル */}
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              ✅ インラインスタイル (赤背景)
              <br />これが見えればHTML/CSS基本は正常
            </div>

            {/* Tailwind基本 */}
            <div className="bg-blue-500 text-white p-5 rounded-lg font-bold">
              🎯 Tailwind基本 (青背景)
              <br />これが見えればTailwind読み込み正常
            </div>

            {/* Tailwind複合 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-xl shadow-lg">
              🌈 Tailwind複合 (グラデーション)
              <br />これが見えればTailwind完全動作
            </div>

            {/* カスタムCSS */}
            <div className="test-red rounded-lg">
              🔧 カスタムCSS (test-red クラス)
              <br />これが見えればglobals.css読み込み正常
            </div>

            {/* ダークモードテスト */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-5 rounded-lg">
              <span className="text-gray-900 dark:text-white font-bold">
                🌙 ダークモードテスト
                <br />背景色が切り替わればダークモード正常
              </span>
            </div>

            {/* 強制CSSテスト */}
            <div className="css-loaded-test rounded-lg">
              🎪 強制CSSテスト
              <br />グラデーション+枠線が見えればCSS完全読み込み
            </div>
          </div>
        </section>

        {/* JavaScript テスト */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            ⚡ JavaScript動作テスト
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <strong>基本演算:</strong> {jsTest}
              </div>
              <div>
                <strong>LocalStorage:</strong> {storageTest}
              </div>
              <div>
                <strong>API接続:</strong> {apiTest}
              </div>
              <div>
                <button
                  onClick={testAlert}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  アラートテスト
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 環境情報 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            🖥️ 環境情報
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>User Agent:</strong> {navigator.userAgent.split(' ')[0]}...
              </div>
              <div>
                <strong>画面サイズ:</strong> {window.innerWidth} × {window.innerHeight}
              </div>
              <div>
                <strong>ダークモード:</strong> {
                  document.documentElement.classList.contains('dark') ? 'ON' : 'OFF'
                }
              </div>
              <div>
                <strong>Cookie有効:</strong> {navigator.cookieEnabled ? 'YES' : 'NO'}
              </div>
              <div>
                <strong>オンライン:</strong> {navigator.onLine ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </section>

        {/* 診断結果 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            📊 診断結果
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 使用方法
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• 問題発生時にこのページを確認</li>
              <li>• 赤背景・青背景が見えない → CSS読み込み問題</li>
              <li>• JavaScript テストが「❌」→ JS実行問題</li>
              <li>• API接続が「❌」→ バックエンド接続問題</li>
              <li>• スクリーンショットをチームで共有可能</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}