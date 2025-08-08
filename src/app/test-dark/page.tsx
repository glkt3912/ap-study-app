'use client';

import { useState } from 'react';

export default function TestDark() {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('TestDark component loaded!');
  }
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Button clicked!');
    }
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 transition-colors'>
      <div className='container mx-auto p-8'>
        <h1 className='text-4xl font-bold text-black dark:text-white mb-8'>ダークモードテスト</h1>

        <div className='test-red p-4 mb-4' style={{ backgroundColor: 'red', color: 'white', padding: '20px' }}>
          🔴 この部分は赤くなるはず（CSS読み込み確認）
        </div>

        <div className='test-blue p-4 mb-4' style={{ backgroundColor: 'blue', color: 'white', padding: '20px' }}>
          🔵 この部分は青くなるはず（CSS読み込み確認）
        </div>

        <div style={{ backgroundColor: 'green', color: 'white', padding: '20px', marginBottom: '20px' }}>
          🟢 インラインスタイル（緑）- これは必ず表示される
        </div>

        <button
          onClick={toggleDark}
          className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl mb-8'
        >
          {isDark ? '☀️ ライトモード' : '🌙 ダークモード'}
        </button>

        <div className='grid grid-cols-2 gap-4'>
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>テストカード 1</h2>
            <p className='text-gray-600 dark:text-gray-300'>この背景色が変わるはずです</p>
          </div>

          <div className='p-4 bg-red-100 dark:bg-red-900 rounded'>
            <h2 className='text-xl font-semibold text-red-900 dark:text-red-100'>テストカード 2</h2>
            <p className='text-red-600 dark:text-red-300'>赤系の色も変わります</p>
          </div>
        </div>
      </div>
    </div>
  );
}
