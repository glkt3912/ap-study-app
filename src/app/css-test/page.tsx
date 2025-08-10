'use client';

import { useState, useEffect } from 'react';

export default function CSSTestPage() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  if (!mounted) {
    return <div className='p-8'>CSS読み込み確認中...</div>;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>🎨 CSS専用テストページ</h1>
          <button onClick={toggleDarkMode} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
            {isDarkMode ? '☀️ ライト' : '🌙 ダーク'}
          </button>
        </div>

        {/* インラインスタイルテスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>📝 インラインスタイルテスト</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              🔴 赤色テスト
              <br />
              インラインCSS
            </div>
            <div
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              🟢 緑色テスト
              <br />
              インラインCSS
            </div>
            <div
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              🔵 青色テスト
              <br />
              インラインCSS
            </div>
          </div>
        </section>

        {/* Tailwind基本色テスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>🌈 Tailwind基本色テスト</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-red-500 text-white p-4 rounded text-center font-bold'>Red 500</div>
            <div className='bg-green-500 text-white p-4 rounded text-center font-bold'>Green 500</div>
            <div className='bg-blue-500 text-white p-4 rounded text-center font-bold'>Blue 500</div>
            <div className='bg-purple-500 text-white p-4 rounded text-center font-bold'>Purple 500</div>
            <div className='bg-yellow-500 text-black p-4 rounded text-center font-bold'>Yellow 500</div>
            <div className='bg-pink-500 text-white p-4 rounded text-center font-bold'>Pink 500</div>
            <div className='bg-indigo-500 text-white p-4 rounded text-center font-bold'>Indigo 500</div>
            <div className='bg-gray-500 text-white p-4 rounded text-center font-bold'>Gray 500</div>
          </div>
        </section>

        {/* Tailwindグラデーションテスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>
            🌅 Tailwindグラデーションテスト
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg text-center font-bold'>
              Purple → Pink
            </div>
            <div className='bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-lg text-center font-bold'>
              Blue → Green
            </div>
            <div className='bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white p-6 rounded-lg text-center font-bold'>
              Yellow → Red → Pink
            </div>
            <div className='bg-gradient-to-tl from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-lg text-center font-bold'>
              Indigo → Purple → Pink
            </div>
          </div>
        </section>

        {/* カスタムCSSテスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>
            🔧 カスタムCSSテスト (globals.css)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='test-red rounded-lg text-center font-bold'>
              test-red クラス
              <br />
              赤背景・白文字
            </div>
            <div className='test-blue rounded-lg text-center font-bold'>
              test-blue クラス
              <br />
              青背景・白文字
            </div>
            <div className='css-loaded-test rounded-lg text-center font-bold'>
              css-loaded-test
              <br />
              グラデーション+枠線
            </div>
          </div>
        </section>

        {/* ダークモードテスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>🌙 ダークモードテスト</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 p-6 rounded-lg'>
              <h3 className='text-gray-900 dark:text-white font-bold mb-2'>背景切り替えテスト</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                ライトモード: 白背景・ダークテキスト
                <br />
                ダークモード: 濃灰背景・ライトテキスト
              </p>
            </div>
            <div className='bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-6 rounded-lg'>
              <h3 className='text-blue-900 dark:text-blue-100 font-bold mb-2'>色相テスト</h3>
              <p className='text-blue-700 dark:text-blue-300'>
                ライトモード: 明るい青系
                <br />
                ダークモード: 暗い青系
              </p>
            </div>
          </div>
        </section>

        {/* Tailwind複合テスト */}
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>🎭 Tailwind複合機能テスト</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* シャドウテスト */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl'>
              <h3 className='font-bold text-gray-900 dark:text-white mb-2'>Shadow Test</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                shadow-2xl
                <br />
                大きな影効果
              </p>
            </div>

            {/* ボーダーテスト */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border-4 border-dashed border-purple-500'>
              <h3 className='font-bold text-gray-900 dark:text-white mb-2'>Border Test</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                border-4 border-dashed
                <br />
                破線ボーダー
              </p>
            </div>

            {/* トランジションテスト */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer'>
              <h3 className='font-bold mb-2'>Transition Test</h3>
              <p className='text-sm'>
                hover:bg-blue-500
                <br />
                ホバーで色変化
              </p>
            </div>
          </div>
        </section>

        {/* 診断結果 */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>📊 CSS診断結果</h2>
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6'>
            <h3 className='font-bold text-green-800 dark:text-green-200 mb-3'>✅ 正常動作の場合</h3>
            <div className='text-sm text-green-700 dark:text-green-300 space-y-1'>
              <div>• インラインスタイル: 赤・緑・青の背景色が表示</div>
              <div>• Tailwind基本: 8色のカラーボックスが表示</div>
              <div>• Tailwindグラデーション: 4種類のグラデーション表示</div>
              <div>• カスタムCSS: 赤・青・グラデーション+枠線が表示</div>
              <div>• ダークモード: 背景とテキスト色が切り替わり</div>
              <div>• 複合機能: 影・ボーダー・ホバー効果が動作</div>
            </div>
          </div>

          <div className='mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6'>
            <h3 className='font-bold text-red-800 dark:text-red-200 mb-3'>❌ 問題がある場合</h3>
            <div className='text-sm text-red-700 dark:text-red-300 space-y-1'>
              <div>• 色が表示されない → CSS読み込み失敗</div>
              <div>• 一部のみ表示 → 部分的なCSS読み込み失敗</div>
              <div>• ダークモード無効 → JavaScript動作問題</div>
              <div>• レイアウト崩れ → Tailwind読み込み問題</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
